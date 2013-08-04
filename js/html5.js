function initHTML5() {
  var container, $container;
  var renderer, camera, scene, light;
  var shield;
  var shieldRotation;

  init();
  animate();

  function init() {
    container = document.getElementById('shield-container');
    $container = $(container);

    camera = new THREE.PerspectiveCamera( 20, $container.width() / $container.height(), 1, 10000 );
    camera.position.z = 1800;

    scene = new THREE.Scene();

    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 0, 1 );
    scene.add( light );

    var loader = new THREE.JSONLoader();
    loader.load("models/html5.js", function(geometry, materials) {
      var material = new THREE.MeshFaceMaterial(materials).materials[0];
      material.color.setHex(0xffffff);
      material.ambient.setHex(0x000000);
      material.shininess = 100;
      material.shading = THREE.FlatShading;

      material.map.minFilter = THREE.LinearFilter;
      material.map.magFilter = THREE.LinearFilter;

      shield = new THREE.Mesh(geometry, material);
      shield.scale.set(0.8, 0.8, 0.8);
      scene.add(shield);
    });

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize($container.width(), $container.height());

    container.appendChild( renderer.domElement );

    var $circle = $container.find('.circle');
    var anim = new Tweenable();

    $circle.on('mouseenter', function() {
      anim.stop();
      anim.tween({
        from: { scale: 0.8 },
        to: { scale: 1.4 },
        duration: 500,
        easing: 'easeOutQuad',
        step: function() {
          shield.scale.set(this.scale, this.scale, this.scale);
        }
      });
      shieldRotation = true;
    });

    $circle.on('mouseleave', function() {
      var destAngle = shield.rotation.y > Math.PI ? 2 * Math.PI : 0;
      var currentScale = shield.scale.x;

      anim.stop();
      anim.tween({
        from: { scale: currentScale, angle: shield.rotation.y },
        to: { scale: 0.8, angle: destAngle },
        duration: 500,
        easing: 'easeOutQuad',
        step: function() {
          shield.scale.set(this.scale, this.scale, this.scale);
          shield.rotation.y = this.angle;
        }
      });
      shieldRotation = false;
    });
  }

  function animate() {
    requestAnimationFrame( animate );
    if (shieldRotation) {
      shield.rotation.y += deg2rad(5);
      if (shield.rotation.y > 2 * Math.PI) {
        shield.rotation.y = 0;
      }
    }
    render();
  }

  function render() {
    camera.lookAt( scene.position );

    renderer.render( scene, camera );
  }
}