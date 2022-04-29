import './style.sass';

const Logger = require('./logger').default;

export default class WebRTCjs {

  constructor(options)
	{
    let defaults = {
      whipUrl:      '',
      logLevel:     'error',
      videoElement: null,

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
	}

  callback(cbName, cbPayload) {
    if (typeof this.settings[cbName] === "function") {
      this.settings[cbName].apply( this, [cbPayload] );
    }
  }

  async publish() {
    this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.pc = new RTCPeerConnection();

    this.pc.onconnectionstatechange = (event) => {
      switch (this.pc.connectionState)
      {
        default:
        this.logger.info('connectionState:', this.pc.connectionState);
        this.callback('onConnectionStateChange', this.pc.connectionState);
        break;
      }
    }

    if (this.settings.videoElement) {
      this.settings.videoElement.srcObject = this.stream;
    }
    this.stream.getTracks().forEach(track => this.pc.addTrack(track, this.stream))

    //Create SDP offer
    const offer = await this.pc.createOffer();

    this.logger.info('offer:', offer.sdp);
    this.callback('onOffer', offer.sdp);

    await this.pc.setLocalDescription (offer)

    this.logger.info('url:', this.settings.whipUrl);

    var fetched;
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

    //Get the SDP answer
    const answer = await fetched.text();
    this.logger.info('answer:', answer);
    this.callback('onAnswer', answer);

    await this.pc.setRemoteDescription ({type:"answer", sdp:answer});

  }
}
