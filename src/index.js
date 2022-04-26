const Logger = require('./logger').default;

export default class WebRTCjs {

  constructor(options)
	{
    let defaults = {
      whipUrl:      '',
      logLevel:     'error',
      videoElement: null
    };

    // Merge defaults and options, without modifying defaults
    this.settings = Object.assign({}, defaults, options);

    this.logger = new Logger(this.settings.logLevel);

    this.logger.info('settings:', this.settings);
	}

  async publish() {
    this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.pc = new RTCPeerConnection();

    this.pc.onconnectionstatechange = (event) => {
      switch (this.pc.connectionState)
      {
        default:
        this.logger.info('connectionState:', this.pc.connectionState);
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

    await this.pc.setLocalDescription (offer)

    this.logger.info('url:', this.settings.whipUrl);
    //Do the post request to the WHIP endpoint with the SDP offer
    const fetched = await fetch (this.settings.whipUrl, {
          method : "POST",
          body: offer.sdp,
          headers:{ "Content-Type" : "application/sdp"}
    });

    //Get the SDP answer
    const answer = await fetched.text();
    this.logger.info('answer:', answer);

    await this.pc.setRemoteDescription ({type:"answer", sdp:answer});

  }
}
