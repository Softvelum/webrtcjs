# WebRTC Javascript library

WebRTC JavaScript publisher library allows adding publishing capabilities to your web pages.
Use its code in your projects or take it as is for embedding into your pages to connect your users to [Nimble Streamer](https://wmspanel.com/nimble).

## Getting Started
```javascript
var config = {
  whipUrl: 'https://127.0.0.1:8443/live/whip?whipauth=username:password'
};
var publisher = new WebRTCjs(config);
publisher.publish();
```

## Configuration options

- `whipUrl` - publish URL with authorization parameters.
- `logLevel` - the log level: `info`, or `error`.
- `videoElement` - `<video>` tag to local monitoring published stream.

## Callbacks

- `onPublisherCreated` - called when publisher instance created with provided configuration. Parameters: `settings`.
- `onConnectionStateChange` - called when connection state changed. Parameters: `connectionState`.
- `onOffer` - called when sdp offer ready. Parameters: `offer`.
- `onAnswer` - called when server answer recewived. Parameters: `answer`.
- `onConnectionError` - called if connection error happens. Has no parameters.

## Callbac usage example

```javascript
var config = {
  whipUrl: 'https://127.0.0.1:8443/live/whip?whipauth=username:password',
  
  onPublisherCreated: function(settings){ console.log('Ready to WebRTC publishing'); }
};
```
