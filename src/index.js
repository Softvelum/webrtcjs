async function publish() {

  stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

  let pc = new RTCPeerConnection()

  pc.onconnectionstatechange = (event) =>{
    switch (pc.connectionState)
    {
      default:
      console.log("ERROR: " + pc.connectionState);
      break;
    }
  }

  document.getElementById('localVideo').srcObject = stream
  stream.getTracks().forEach(track => pc.addTrack(track, stream))

  //Create SDP offer
  const offer = await pc.createOffer();

  console.log("ERROR: offser\n" + offer.sdp);

  await pc.setLocalDescription (offer)

  url = "https://127.0.0.1:8443/live/whip?whipauth=alex:alex"
  //Do the post request to the WHIP endpoint with the SDP offer
  const fetched = await fetch (url, {
        method : "POST",
        body: offer.sdp,
        headers:{ "Content-Type" : "application/sdp"}
  });

  //Get the SDP answer
  const answer = await fetched.text();
  console.log("ERROR: answer\n" + answer);

  await pc.setRemoteDescription ({type:"answer", sdp:answer});

}


publish();
