import './style.sass';

const Logger = require('./logger').default;

export default class WebRTCjs {

  constructor(options)
	{
    let defaults = {
      whipUrl:      '',
      logLevel:     'error',
      videoElement: null,
      videoBandwidth: 0,
      width: 640,
      height: 480,
      videoRequired: true,
      audioRequired: true,
      onConnectionStateChange: null,
      onPublisherCreated: null,
      onOffer: null,
      onAnswer: null,
      onConnectionError: null
    };

    // Merge defaults and options, without modifying defaults
    this.settings = Object.assign({}, defaults, options);

    this.logger = new Logger(this.settings.logLevel);

    this.logger.info('settings:', this.settings);
    this.callback('onPublisherCreated', this.settings);

    if ("undefined" != typeof window){
      window.webRTCjsInstance = this; // Firefox GC workaround
    }
	}

  callback(cbName, cbPayload) {
    if (typeof this.settings[cbName] === "function") {
      this.settings[cbName].apply( this, [cbPayload] );
    }
  }

  async publish() {

    let constraints = {};


    constraints.audio = this.settings.audioRequired;
    if(this.settings.videoRequired) {
        constraints.video = {
            width: this.settings.width,
            height: this.settings.height
        };
    } else {
      constraints.video = false;
    }

    this.stream = await navigator.mediaDevices.getUserMedia(constraints);

    this.pc = new RTCPeerConnection();
   

    if (this.pc.connectionState != undefined) {
        this.pc.onconnectionstatechange = (event) => {
          switch (this.pc.connectionState)
          {
            default:
            this.logger.info('connectionState:', this.pc.connectionState);
            this.callback('onConnectionStateChange', this.pc.connectionState);
            break;
          }
        }
    } else {
        this.pc.oniceconnectionstatechange = event => {
            this.logger.info('iceConnectionState:', this.pc.iceConnectionState);
            this.callback('onIceconnectionStateChange', this.pc.iceConnectionState);
        };

    }

    if (this.settings.videoElement) {
      this.settings.videoElement.srcObject = this.stream;
    }

    this.stream.getTracks().forEach(track => this.pc.addTrack(track, this.stream))


    //Create SDP offer
    const offer = await this.pc.createOffer();

    // !!!!!!!!! Start offer mungling!!!!!!!!!!!!!!
    // mangle sdp to add NACK support for opus
    // To add NACK in offer we have to add it manually see https://bugs.chromium.org/p/webrtc/issues/detail?id=4543 for details

    let opusCodecId = offer.sdp.match(/a=rtpmap:(\d+) opus\/48000\/2/);
    
    if(opusCodecId !== null) {
      offer.sdp = offer.sdp.replace("opus/48000/2\r\n", "opus/48000/2\r\na=rtcp-fb:"+opusCodecId[1]+ " nack\r\n")
    }
    // !!!!!!!!!!! Stop offer mungling !!!!!!!!!!!!!!!1

    this.logger.info('offer:', offer.sdp);
    this.callback('onOffer', offer.sdp);

    await this.pc.setLocalDescription (offer)

    this.logger.info('url:', this.settings.whipUrl);

    let fetched;
    try {
      //Do the post request to the WHIP endpoint with the SDP offer
      fetched = await fetch (this.settings.whipUrl, {
            method : "POST",
            body: offer.sdp,
            headers:{ "Content-Type" : "application/sdp"}
      });
    } catch (error) {
      this.logger.error('Connection error'); //todo handle connection error w/o try/catch
      this.callback('onConnectionError', 'Connection error');
    }

    if (!fetched.ok) {
      this.logger.error('Connection error ' + fetched.status); //todo handle connection error w/o try/catch
      this.callback('onConnectionError', 'Connection error ' + fetched.status);
      this.logger.error(fetched);
      return;
    }

    if (fetched.headers.get("location")) {
      this.location = new URL(fetched.headers.get("location"), this.settings.whipUrl);
    }

    //Get the SDP answer
    const answer = await fetched.text();
    this.logger.info('answer:', answer);
    this.callback('onAnswer', answer);

    await this.pc.setRemoteDescription ({type:"answer", sdp:answer});

    window.webRTCjsInstance.pc.getSenders().forEach(sender=>{
      if(sender.track.kind==="video") {
        let parameters = sender.getParameters();

        if (!parameters.encodings || undefined === parameters.encodings[0]) {
          parameters.encodings = [{}]; // old safari need this
        }
        let bandwidth = parseInt(this.settings.videoBandwidth);

        if (Number.isNaN(bandwidth)) {
          delete parameters.encodings[0].maxBitrate;
        } else {
          parameters.encodings[0].maxBitrate = bandwidth * 1000;
        }
        
        sender.setParameters(parameters)
            .then(() => {
              this.logger.info('bandwidth limit is set', bandwidth);
            })
            .catch(e => console.error(e));
      }
    });
  }

  async stop()
  {
    if (!this.pc) {
      // Already stopped
      return
    }

    if (this.location) {
      let fetched;
      try {
        //Send a delete
        fetched = await fetch(this.location, {
          method: "DELETE"
        });
      } catch (error) {
        this.logger.error('failed to delete session with error ' + error); //todo handle connection error w/o try/catch
        this.callback('onConnectionError', 'Connection error ' + error);
      }

      if (!fetched.ok) {
        this.logger.error('failed to delete session ' + fetched.status); //todo handle connection error w/o try/catch
        this.callback('onConnectionError', 'failed to delete session ' + fetched.status);
        this.logger.error(fetched);
        return;
      }
      this.callback('onConnectionStateChange', 'session deleted');
    }


    this.settings.videoElement.srcObject = null;
    // wait a little before pc.close to send some frames to Nimble to make it handle DELETE requests
    // if we run close right after DELETE nimble will wait to ice timeout and delete session only after that
    await new Promise(r => setTimeout(r, 200));
    this.pc.close();
    this.pc = null;

    this.callback('onConnectionStateChange', 'disconnected');
  }
}
