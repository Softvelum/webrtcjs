# WebRTC Javascript library

WebRTC JavaScript publisher library allows adding WebRTC publishing capabilities to your web pages.
It uses WHIP signaling.

Use its code in your projects or take it as is for embedding into your pages to connect your users to [Nimble Streamer](https://wmspanel.com/nimble).
To learn more about server setup, [read WebRTC setup article](https://blog.wmspanel.com/2022/05/webrtc-publish-setup-nimble-streamer.html).

The following codecs can be used:
* H.264/AVC, VP8, VP9 video
* H.265/HEVC video [on Apple devices](https://blog.wmspanel.com/2022/07/hevc-webrtc-apple.html)
* Opus audio

Specific codecs can be set via "videocodecs" parameter is WHIP URL.

Use [demo publishing page](https://softvelum.com/webrtc/demo/) to publish to your Nimble Streamer instance.

## Getting Started

### Add library to HTML
```html
<script defer="defer" src="e32af6a81c16a82154b7.bundle.js"></script>
```

### Usage
```javascript
var config = {
  whipUrl: 'https://127.0.0.1:8443/live/whip?whipauth=username:password'
};
var publisher = new WebRTCjs(config);
publisher.publish();
```

### Full example
```html
<!DOCTYPE html>
<html>
  <head>
    <script defer="defer" src="e32af6a81c16a82154b7.bundle.js"></script>
  </head>
  <body>
    <script type="text/javascript">
      document.addEventListener("DOMContentLoaded", function(event) {
        var config = {
          whipUrl: 'https://127.0.0.1:8443/live/whip?whipauth=username:password',
        };
        var publisher = new WebRTCjs(config);
        publisher.publish();
      });
    </script>
  </body>
</html>
```

## Configuration options

- `whipUrl` - publishing URL with authorization parameters.
- `logLevel` - the log level: `info`, or `error`.
- `videoElement` - `<video>` tag to local monitoring published stream.
- `videoSelect` - `<select>` tag with available cameras.

## Callbacks

- `onPublisherCreated` - called when publisher instance has been created with the provided configuration. Parameters: `settings`.
- `onConnectionStateChange` - called when connection state has changed. Parameters: `connectionState`.
- `onOffer` - called when SDP offer is ready. Parameters: `offer`.
- `onAnswer` - called when server answer has been received. Parameters: `answer`.
- `onConnectionError` - called if connection error happens. Has no parameters.

## Callback usage example

```javascript
var config = {
  whipUrl: 'https://127.0.0.1:8443/live/whip?whipauth=username:password',

  onPublisherCreated: function(settings){ console.log('Ready to WebRTC publishing'); }
};
```

## Related documentation
- [WebRTC in Softvelum products](https://softvelum.com/webrtc/)
- [WebRTC setup in Nimble Streamer](https://blog.wmspanel.com/2022/05/webrtc-publish-setup-nimble-streamer.html)
- Video: [WebRTC ingest setup in Nimble Streamer](https://www.youtube.com/watch?v=o7DnQuLLerM)
- [Opus audio support in SLDP](https://blog.wmspanel.com/2022/07/opus-sldp.html)
- [Play audio-only SLDP with Opus on iPhone](https://blog.wmspanel.com/2022/09/audio-sldp-opus-webrtc-iphone.html)
