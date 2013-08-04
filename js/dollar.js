function initDollar() {
  var container, $container;
  var renderer, camera, scene, light;
  var dollar;
  var isExtruded = false;

  init();
  animate();

  function init() {
    container = document.getElementById('dollar-container');
    $container = $(container);

    camera = new THREE.PerspectiveCamera( 90, $container.width() / $container.height(), 1, 10000 );
    camera.position.z = 200;

    scene = new THREE.Scene();

    var omni = new THREE.PointLight(0xffffff, 1, 300);
    omni.position.set(0, 0, 100);
    scene.add(omni);

    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 0, 80 );
    light.castShadow = true;
    light.shadowBias = 0.01;
    light.shadowDarkness = 0.25;
    light.shadowMapWidth = 1024;
    light.shadowMapHeight = 1024;
    light.shadowCameraFar = 500;
    scene.add( light );

    var loader = new THREE.JSONLoader();
    loader.load("models/dollar.js", function(geometry, materials) {
      var material = new THREE.MeshFaceMaterial(materials).materials[0];
      material.color.setHex(0xffffff);
      material.emissive.setHex(0x444444);
      material.shading = THREE.FlatShading;

      dollar = new THREE.Mesh(geometry, material);
      dollar.scale.set(1, 1, 0.01);
      dollar.position.x = 8;
      dollar.castShadow = false;
      scene.add(dollar);
    });

    var disc = new THREE.Mesh(new THREE.CircleGeometry(130, 50), new THREE.MeshBasicMaterial({ color: 0x1ecd6d, wireframe: false }));
    disc.receiveShadow = true;
    scene.add(disc);

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( $container.width(), $container.height() );
    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;

    container.appendChild( renderer.domElement );

    var $circle = $('.circle');
    var anim = new Tweenable();

    $container.on('mouseenter', function() {
      if (dollar) {
        extrude();
      }
    });

    $container.on('mouseleave', function() {
      if (dollar) {
        flatten();
      }
    });

    $container.on('mousemove', function(e) {
      var mouseX = e.pageX - $container.offset().left - 150;
      var mouseY = e.pageY - $container.offset().top - 150;
      light.position.set(mouseX, -mouseY, light.position.z);
    });
  }

  function extrude() {
    isExtruded = true;
    dollar.castShadow = true;
    var tween = new Tweenable();
    tween.tween({
      from: { z: dollar.scale.z },
      to: { z: 1.5 },
      duration: 300,
      easing: 'easeOutQuad',
      step: function() {
        dollar.scale.z = this.z;
      }
    });
  }

  function flatten() {
    isExtruded = false; 
    var tween = new Tweenable();
    tween.tween({
      from: { z: dollar.scale.z },
      to: { z: 0.01 },
      duration: 300,
      easing: 'easeOutQuad',
      step: function() {
        dollar.scale.z = this.z;
      },
      callback: function() {
        if (!isExtruded) {
          dollar.castShadow = false;
        }
      }
    });
  }

  function animate() {
    requestAnimationFrame(animate);

    render();
  }

  function render() {
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
}