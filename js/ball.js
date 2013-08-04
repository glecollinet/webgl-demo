function initBall() {
  var container, $container;
  var renderer, camera, scene, light;
  var ball, rotateBall;
  var $circle = $('.circle');
  var $shadow = $('.shadow');
  var bounce;
  var bounceUpTween, bounceDownTween, compressTween, releaseTween;
  var compressTimeout;
  var resetting = false;



  init();
  animate();

  function init() {
    container = document.getElementById( 'ball-container' );
    $container = $(container);

    camera = new THREE.PerspectiveCamera( 20, $container.width() / $container.height(), 1, 10000 );
    camera.position.z = 1800;

    scene = new THREE.Scene();

    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 0, 1 );
    scene.add( light );

    var ballGeometry  = new THREE.IcosahedronGeometry(120, 1);
    ballGeometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 120, 0 ) );
    var iconSphereMaterials = [
                                new THREE.MeshLambertMaterial({ color: 0xffffff, shading: THREE.FlatShading, opacity: 0.2, transparent: true, side: THREE.BackSide }),
                                new THREE.MeshBasicMaterial( { color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true })
                              ];
    ball = THREE.SceneUtils.createMultiMaterialObject( ballGeometry, iconSphereMaterials );
    ball.rotation.y = deg2rad(90);
    ball.position.y = -120;
    scene.add(ball);

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( $container.width(), $container.height() );

    container.appendChild( renderer.domElement );
    var $circle = $container.find('.circle');

    $circle.on('mouseenter', function() {
      if (!resetting) {
        compress();
      }
      rotateBall = true;
      bounce = true;
    });

    $circle.on('mouseleave', function() {
      bounce = false;
      rotateBall = false;
      if (!resetting) {
        reset();
      }
    });
  }

  function scaleShadow(s) {
    $shadow.css({
      '-webkit-transform': 'scale('+s+')',
      '-moz-transform': 'scale('+s+')',
      '-ms-transform': 'scale('+s+')',
      '-o-transform': 'scale('+s+')',
      'transform': 'scale('+s+')'
    });
  }

  function bounceUp() {
    var height = 75;
    var duration = 400;

    bounceUpTween = new Tweenable();
    bounceUpTween.tween({
      from: { y: -120, s: 1 },
      to: { y: height, s: 0.5 },
      duration: duration,
      easing: 'easeOutQuad',
      step: function() {
        ball.position.y = this.y;
        scaleShadow(this.s);
      },
      callback: bounceDown
    });
  }

  function bounceDown() {
    var height = 75;
    var duration = 250;

    bounceDownTween = new Tweenable();
    bounceDownTween.tween({
      from: { y: height, s: 0.5 },
      to: { y: -120, s: 1 },
      duration: duration,
      easing: 'easeInQuad',
      step: function() {
        ball.position.y = this.y;
        scaleShadow(this.s);
      }
    });

    compressTimeout = setTimeout(compress, duration - 80);
  }

  function compress() {
    var duration = 80;

    compressTween = new Tweenable();
    compressTween.tween({
      from: { y: 1 },
      to: { y: 0.5 },
      duration: duration,
      easing: 'easeInOutQuad',
      step: function() {
        ball.scale.y = this.y;
      },
      callback: release
    });
  }

  function release() {
    var duration = 80;

    releaseTween = new Tweenable();
    releaseTween.tween({
      from: { y: 0.5 },
      to: { y: 1 },
      duration: duration,
      easing: 'easeInOutQuad',
      step: function() {
        ball.scale.y = this.y;
      }
    });

    bounceUp();
  }

  function reset() {
    resetting = true;

    if (bounceUpTween) bounceUpTween.stop();
    if (bounceDownTween) bounceDownTween.stop();
    if (compressTween) compressTween.stop();
    if (releaseTween) releaseTween.stop();
    clearTimeout(compressTimeout);

    resetTween = new Tweenable();
    resetTween.tween({
      from: { y: ball.position.y, angle: ball.rotation.y, scale: ball.scale.y },
      to: { y: -120, angle: 0, scale: 1 },
      duration: 500,
      easing: 'bounce',
      step: function() {
        ball.position.y = this.y;
        ball.scale.y = this.scale;
      },
      callback: function() {
        resetting = false;
        if (bounce) {
          compress();
        }
      }
    });
  }

  function animate() {
    requestAnimationFrame( animate );
    if (rotateBall) {
      ball.rotation.y += deg2rad(2);
    }
    render();
  }

  function render() {
    camera.lookAt( scene.position );

    renderer.render( scene, camera );
  }
}