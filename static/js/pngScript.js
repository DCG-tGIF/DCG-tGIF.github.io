var shots = [];
var count = 0;

function sleep (delay) {
  var start = new Date().getTime();
  while (new Date().getTime() < start + delay);
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function getResults(grabLimit, grabRate) {
  var zip = new JSZip();
  var searchParams = (new URL(window.location.href)).searchParams;
  var childName = searchParams.get('mN') || "c445_02";
  for (var i = 0; i < shots.length; i++) {
    var filename = childName + "_" + pad(i, 4) + ".png";
    zip.file(filename, shots[i], {binary:true});
  }
  zip.generateAsync({type:"blob"}, function updateCallback(metadata) {
  })
  .then(function callback(blob) {
    saveAs(blob, childName + "_" + canvas.width + "_" + canvas.height + "_" + grabLimit + "_" + grabRate + ".zip");
  }, function (e) {
    showError(e);
  });
}

function getPNGImage() {
  var childName = searchParams.get('mN') || "c445_02";
  var mS = searchParams.get('mS') || 1;
  var mX = searchParams.get('mX') || 0;
  var mY = searchParams.get('mY') || 0;

  var canv = document.getElementById("canvas");
  canvas.toBlob(function(blob) {
    saveAs(blob, childName + "_" + canvas.width + "_" + canvas.height + "_" + mS + "_" + mX + "_" + mY + ".png");
  });
}

function getPNGsLQHS(grabLimit, grabRate, mtn) {
  shots = [];
  count = 0;

  if (mtn == 'idle')
    motionMgr.startMotion(motionIdle);
  else if (mtn == 'hit')
    motionMgr.startMotion(motionHit);
  else
    motionMgr.startMotion(motionClick);

  var grabber = setInterval(function(){
    if (count > grabLimit) {
      clearInterval(grabber);
      getResults(grabLimit, grabRate);
    }
    var encodedImg = canvas.toDataURL("image/png").replace("data:image/png;base64,", "");
    var img = window.atob(encodedImg);
    shots.push(img);
    count++;
  }, grabRate);
}

function getPNGsSpaLQHS(grabLimit, grabRate, mtn) {
  shots = [];
  count = 0;

  if (mtn == 'max' || mtn == 'maxtouch')
    switchSpa(true)
  else
    switchSpa(false)

  if (mtn == 'idle')
    motionMgr.startMotion(motionIdle);
  else if (mtn == 'max')
    motionMgr.startMotion(motionMax);
  else if (mtn == 'maxtouch')
    motionMgr.startMotion(motionMaxtouch);
  else
    motionMgr.startMotion(motionClick);

  var grabber = setInterval(function(){
    if (count > grabLimit) {
      clearInterval(grabber);
      getResults(grabLimit, grabRate);
    }
    var encodedImg = canvas.toDataURL("image/png").replace("data:image/png;base64,", "");
    var img = window.atob(encodedImg);
    shots.push(img);
    count++;
  }, grabRate);
}

function getPNGsFull(mtn) {
  shots = [];
  count = 0;
  var motionFile;
  var dir = "static/Korean/"

  if (mtn == 'idle')
    motionFile = modelJson.motions.idle[0].file
  else if (mtn == 'hit')
    motionFile = modelJson.motions.hit[0].file
  else if (mtn == 'attack')
    motionFile = modelJson.motions.attack[0].file
  else if (mtn == 'touch')
    motionFile = modelJson.motions.touch[0].file
  else if (mtn == 'max')
    motionFile = modelJson.motions.max[0].file
  else if (mtn == 'maxtouch')
    motionFile = modelJson.motions.maxtouch[0].file

  loadBytes(getPath(dir, motionFile), 'arraybuffer', function(buf) {
    motionGrab = new Live2DMotion.loadMotion(buf)
    // remove fade in/out delay to make it smooth
    motionGrab._$eo = 0
    motionGrab._$dP = 0
    var grabFPS = motionGrab._$D0;
    motionGrab._$D0 = 5
    var grabLimit = motionGrab._$yT;
    var grabRate = 1000 / motionGrab._$D0
    motionGrab._$rr = grabLimit * grabRate
    for (var i = 0; i < motionGrab.motions.length; i++) {
      if (motionGrab.motions[i]._$I0.length <= 1)
        continue
      motionGrab.motions[i]._$RP = 1
    }

    motionMgr.startMotion(motionGrab);

    var grabber = setInterval(function(){
      if (count >= grabLimit) {
        clearInterval(grabber);
        getResults(grabLimit, grabFPS);
      }
      var encodedImg = canvas.toDataURL("image/png").replace("data:image/png;base64,", "");
      var img = window.atob(encodedImg);
      shots.push(img);
      count++;
    }, grabRate);
  })
}

function getPNGsFullSpa(mtn) {
  shots = [];
  count = 0;
  var motionFile;
  var dir = "static/Korean/"

  if (mtn == 'max' || mtn == 'maxtouch')
    switchSpa(true)
  else
    switchSpa(false)

  getPNGsFull(mtn)
}
