/**
 *
 */
// import * from "./three.js"
// import * from "./dat.gui.js"
// import * from "./OrbitControls.js"

class DDV {
	constructor(canvas=false, boxcolor='rgb(10%, 40%, 80%)', bgcolor=0xFFFFFF) {
		this.boxcolor = boxcolor;
		this.bgcolor = bgcolor;

		// pick 할 때 사용
		this.raycaster = new THREE.Raycaster();
		this.objClicked = false;
		this.label_show = null;
		this.pickedObject = null;
		this.clickedObject = null;
		this.clickedText = undefined;
		this.pickedObjectSavedColor = 0;
		this.pickedObjectClickedColor = {
			'r': 0,
			'g': 0,
			'b': 0
		};

		this.pickPosition = {x: 0, y: 0};
		this.canvas = canvas;
		this.font = undefined;
	}
	get_position(){
		return this.pickPosition;
	}
	pick(normalizedPosition, scene, camera, time) {
		if(this.canvas) {
			// 이미 다른 물체를 피킹했다면 색을 복원합니다
			if (this.pickedObject) {
			this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
			this.pickedObject = undefined;
			}

			// 절두체 안에 광선을 쏩니다
			this.raycaster.setFromCamera(normalizedPosition, camera);
			// 광선과 교차하는 물체들을 배열로 만듭니다
			const intersectedObjects = this.raycaster.intersectObjects(scene.getInstancegroup().children);

			if (intersectedObjects.length) {

			// 첫 번째 물체가 제일 가까우므로 해당 물체를 고릅니다
			this.pickedObject = intersectedObjects[0].object;
			
			// 기존 색을 저장해둡니다
			this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();

			if(this.objClicked){

				if(this.clickedObject != null && this.label_show === null){
					console.log(this.clickedObject)
				}
			}else {
				// emissive 색을 빨강/노랑으로 빛나게 만듭니다
				console.log(this.pickedObject.material)
				this.pickedObject.material.emissive.setHex((time * 5) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
			}
			}
		}
	}
	pickClickEvent(){
		if(this.canvas) {
			if(this.pickedObject != undefined){   // 빤짝이는 것을 눌렀을 때만 on이 됨
				this.objClicked = !this.objClicked;   // on click
	
				if (this.clickedObject == null) {
					this.clickedObject = this.pickedObject;
					// 기존 정보 저장
					this.pickedObjectClickedColor.r = this.clickedObject.material.color.r;
					this.pickedObjectClickedColor.g = this.clickedObject.material.color.g;
					this.pickedObjectClickedColor.b = this.clickedObject.material.color.b;
	
					// 눌렸다는 표시
					this.clickedObject.material.color.r = this.clickedObject.material.color.r * 0.5;
					this.clickedObject.material.color.g = this.clickedObject.material.color.g * 0.5;
					this.clickedObject.material.color.b = this.clickedObject.material.color.b * 0.5;
					// this.clickedObject.material.wireframe = true;
				}
				else { // Off 작동
					this.clickedObject.material.color.r = this.pickedObjectClickedColor.r;
					this.clickedObject.material.color.g = this.pickedObjectClickedColor.g;
					this.clickedObject.material.color.b = this.pickedObjectClickedColor.b;
					// this.clickedObject.material.wireframe = false;
					this.clickedObject = null;
					this.label_show.visible = false;
					this.label_show = null;
				}
			} else if (this.objClicked){    // Off 작동
				this.clickedObject.material.color.r = this.pickedObjectClickedColor.r;
				this.clickedObject.material.color.g = this.pickedObjectClickedColor.g;
				this.clickedObject.material.color.b = this.pickedObjectClickedColor.b;
				// this.clickedObject.material.wireframe = false;
				this.clickedObject = null;
				this.objClicked = false;
				this.label_show.visible = false;
				this.label_show = null;
			}
			}
	}
		
	clearPickPosition() {
		if(this.canvas) {
		this.pickPosition['x'] = -100000;
		this.pickPosition['y'] = -100000;
		}
	}
		
	setPickPosition(event) {
		if(this.canvas) {
		const rect = this.canvas.getBoundingClientRect();

		const pos = {
			x: (event.clientX - rect.left) * this.canvas.width / rect.width,
			y: (event.clientY - rect.top) * this.canvas.height / rect.height,
		};
		this.pickPosition.x = (pos.x / this.canvas.width) * 2 - 1;
		this.pickPosition.y = (pos.y / this.canvas.height) * -2 + 1;  // Y 축을 뒤집었음
		}
	}

	Box3Dchart(data,boxwidth, boxheight, dst = 1, x_label = null, y_label = null, use_auto_color = true, yaxis_segment = 10, boxcolor='rgb(10%, 40%, 80%)'){
		
		function make_chart(data, boxwidth, boxheight, boxcolor, dst, a, b){
			let geometry = new THREE.BoxGeometry(
				boxwidth,
				data,
				boxheight
			);
			
			if(use_auto_color===true){
				boxcolor = auto_color(max_value,data);
			}
			let material = new THREE.MeshPhongMaterial({color: boxcolor})
			let cube = new THREE.Mesh(geometry, material);
			cube.position.x = (boxwidth + dst) * a;
			cube.position.y = (data) / 2
			cube.position.z = (boxheight + dst) * b;
			cube.castShadow = true;
			return cube
		}

		function make_wall(data, boxwidth, boxheight, dst, x_label, y_label, max_value, yaxis_segment, distance_towall=1.5) {
			let wall_group = new THREE.Group();
			{ // 바닥
				let geometry = new THREE.PlaneGeometry(data.length * (boxwidth + dst) + 2*distance_towall,(data[0].length * (boxheight + dst)) + 2*distance_towall);
				let material = new THREE.MeshBasicMaterial( {color: 0xe5ecf6} );
				let plane_bottom = new THREE.Mesh( geometry, material );
				plane_bottom.position.set(
					((data.length - 1) * (boxwidth + dst)) / 2,
					0,
					((data[0].length - 1) * (boxheight + dst)) / 2
				);
				plane_bottom.rotation.x = 1.5* Math.PI;
				
				if (x_label!=null && x_label.length == data[0].length){
					for(let i = 0; i <data[0].length ; i++){
						make_label(x_label[i],'helvetiker_regular.typeface.json',plane_bottom,(-(data.length)/2)*(boxwidth + dst)-distance_towall-1*x_label[i].length,(boxheight + dst)*(-i+(data[0].length/2)-0.5),0.2);
					}
				};
				if (y_label!=null && y_label.length == data[0].length){
					for(let i = 0; i <data.length ; i++){
						make_label(y_label[i],'helvetiker_regular.typeface.json',plane_bottom,(boxwidth + dst)*(-i+(data.length/2)-0.5),(-(data[0].length)/2)*(boxheight + dst)-distance_towall-1,0.2,0,0,1.5*Math.PI);
					}
				};
				wall_group.add(plane_bottom);
			}
			

			let width = [(data.length * (boxwidth + dst) + 2*distance_towall),(data[0].length * (boxheight + dst) + 2*distance_towall)];
			let height = (max_value + 2*distance_towall)/yaxis_segment;
			let position_x = [
				((data.length-1)*(boxwidth+dst))/2,
				(-0.5*(boxwidth+dst)-distance_towall),
				((data.length-1)*(boxwidth+dst))/2,
				((data.length-0.5) * (boxwidth + dst)+distance_towall)
			];
			let position_z = [
				(-0.5*(boxheight+dst)-distance_towall),
				((data[0].length-1) * (boxheight + dst))/2,
				((data[0].length -0.5) * (boxheight + dst))+distance_towall,
				((data[0].length-1) * (boxheight + dst))/2
							];
			
			let material = new THREE.MeshBasicMaterial( { color: 0xe5ecf6 } );
			for(let i=0; i<yaxis_segment; i++) {
				
				for (let j=0; j<4; j++) {
					let geometry = new THREE.PlaneGeometry(width[j%2],height);
					
					let plane = new THREE.Mesh( geometry, material );
					
					plane.position.set(
						position_x[j],
						((max_value + 2*distance_towall) / yaxis_segment)*(0.5+i)+i*0.1,
						position_z[j]
					);
					plane.rotation.y = 0.5*j*Math.PI;

					wall_group.add(plane);
				}
			};

			return wall_group
		}
		function auto_color(max_value,cur_value){
			let red = Math.round((cur_value/max_value)*100);
			let color = 'rgb('+String(red)+'%, 40%, 80%)';
			
			return color;

		}

		function make_light(data, boxwidth, boxheight, dst){
			let color = 0xFFFFFF;
			let intensity = 1;
			let light = new THREE.PointLight(color, intensity);
			light.castShadow = true;
			//차트 중앙 위치, 그리고 max_value의 2배 되는 높이에서 뽷
			light.position.set(
				data.length * (boxwidth + dst) * 0.6,
				max_value * 2,
				data[0].length * (boxheight + dst) * 0.6
			);
			return light
		}

		function read_array(data, boxwidth, boxheight, boxcolor, dst){
			let box_group = new THREE.Group();
			for (let i = 0; i < (data.length); i++) {
				for (let j = 0; j < data[i].length; j++) {
					box_group.add(make_chart(data[i][j], boxwidth, boxheight, boxcolor, dst, i, j));
				}
			}
			return box_group;
		}

		function make_label(text,font_path='helvetiker_regular.typeface.json',group,positionx,positiony,positionz,rotationx=0,rotationy=0,rotationz=0){
			
			let loader = new THREE.FontLoader();
			loader.load( font_path, function ( font ) {

				let textGeo = new THREE.TextGeometry( text, {

					font: font,
					size: 0.7,
					height: 0,
					curveSegments: 11,
				} );
				
				let textMaterial = new THREE.MeshPhongMaterial( { color: 0x000000} );

				let mesh = new THREE.Mesh( textGeo, textMaterial );
				
				mesh.position.set(positionx,positiony,positionz)
				if (rotationx !=0){ mesh.rotation.x = rotationx };
				if (rotationy !=0){ mesh.rotation.y = rotationy };
				if (rotationz !=0){ mesh.rotation.z = rotationz };
				group.add( mesh );
				
			} );
		}

		let maxRow = data.map(function (row) {
			return Math.max.apply(Math, row);
		});
		let max_value = Math.max.apply(null, maxRow);

		//리턴시킬 그룹객체
		let group_start = new THREE.Group();

		// 벽 그리기
		let wall = make_wall(data, boxwidth, boxheight, dst,x_label,y_label, max_value, yaxis_segment);
		wall.name="wall";
		group_start.add(wall);
	

		//빛뿌리기
		let light =make_light(data, boxwidth, boxheight, dst);
		light.name="light";
		group_start.add(light);
		
		//그래프 만들기
		let box_group = read_array(data, boxwidth, boxheight, boxcolor, dst);
		box_group.name = "box_group"
		group_start.add(box_group);

		group_start.pushData=function(new_data){ // 리얼타임 데이터
			let init_arr = data.flat();
			let arr = new_data.flat();
			if (arr.length == box_group.children.length){ //shape 같을때만 동작
				for (let i = 0; i < (arr.length); i++) {
					box_group.children[i].scale.set(1,(arr[i]/init_arr[i])/2,1)
					box_group.children[i].position.y = (box_group.children[i].geometry.parameters.height * box_group.children[i].scale.y)/2;
				}
			}
		}

		group_start.getInstancegroup=function(){ // 리얼타임 데이터
			return box_group;
		}
		
		return group_start;
	}

	donut3Dchart(data,radius=13, thickness=2.5,title=null, label=null, draw_wall=true){
		
		let total_data = data.reduce(function add(sum, currValue) {
			return sum + currValue;
		}, 0);
		function ran_color(){ return "#"+Math.round(Math.random()*0xffffff).toString(16);}

		function make_chart(radius,thickness,color=ran_color(),arc){
			let geometry = new THREE.TorusGeometry( radius, thickness, 30, 200,arc);
			let material = new THREE.MeshPhongMaterial({color: color, shininess:120})
			let donut = new THREE.Mesh(geometry, material);
			
			return donut
		}

		function make_wall(radius,thickness,distance_towall=7.2,bottom_height=3,cylinder_height=30.0) {
			//벽만들기
			let wall_group = new THREE.Group();
			let geometry = new THREE.CylinderGeometry((radius+2*thickness)+distance_towall,(radius+2*thickness)+distance_towall,bottom_height,32,1);
			let material = new THREE.MeshPhysicalMaterial( {color: 0xdddddd,metalness:0.3,roughness:0.2} );
			let plane_bottom = new THREE.Mesh( geometry, material );
			plane_bottom.position.y = -bottom_height/2
			plane_bottom.receiveShadow = true;
			
			make_label(title,2.2,0.5,'helvetiker_regular.typeface.json',plane_bottom,-1.45*title.length/2,bottom_height/1.7,1.2*radius+2*thickness,1.5*Math.PI,0,0,0xffffff);
			
			if (label && label.length == data.length){
			plane_bottom.add(make_board(2*((radius+2*thickness)+distance_towall)*Math.sin(Math.PI/9),0.6*cylinder_height+bottom_height,((radius+2*thickness)+distance_towall)*0.9))	
			}
			wall_group.add(plane_bottom);

			if (draw_wall){
			let c_geometry = new THREE.CylinderGeometry((radius+2*thickness)+distance_towall,(radius+2*thickness)+distance_towall,cylinder_height,32,1,true);
			let c_material = new THREE.MeshPhysicalMaterial( {color: 0xeeeeee,flatShading:true, side:1 ,metalness:0.3,roughness:0.2} );
			let cylinder = new THREE.Mesh( c_geometry, c_material );
			cylinder.position.y = cylinder_height/2 - bottom_height
			wall_group.add( cylinder );
			}
		
			return wall_group
		}

		function make_board(width,height,distance){
			let geometry = new THREE.PlaneGeometry( width, height );
			let material = new THREE.MeshBasicMaterial( {color: 0xeeeeee, side: 1} );
			let plane = new THREE.Mesh( geometry, material );
			for (let i=0;i<data.length;i++){
				let sgeometry = new THREE.SphereGeometry( 1,32, 16 );
				// let smaterial = new THREE.MeshBasicMaterial( {color: donut_group.children[i].material.color, side: 2} );
				let splane = new THREE.Mesh( sgeometry, donut_group.children[i].material );
				splane.position.set(-0.3*width,(height/(data.length+1))*(data.length/2-i-0.5),0.1);
				make_label(label[i],1.2,0.2,'helvetiker_regular.typeface.json',splane,0.1*width,-0.5,0);

				plane.add(splane);
			}
			
			plane.position.y = 0.7*height;
			plane.position.z = -distance;
			return plane;
		}

		function make_light(radius,thickness,distance_towall=10){
			let color = 0xFFFFFF;
			let intensity = 0.5;
			let light = new THREE.PointLight(color,intensity);
			light.castShadow = true;
			light.shadow.mapSize.width = 1024;
			light.shadow.mapSize.height = 1024;
			light.position.set(
				0,(radius+thickness)*2+distance_towall,0
			);
			return light
		}

		function read_array(data){
			let donut_group = new THREE.Group();
			let rotate_factor = 0;
			for (let i = 0; i < (data.length); i++) {
				let arc_temp = 2* Math.PI * (data[i]/total_data);
				let donut=make_chart(radius,thickness,ran_color(),arc_temp)
				donut.rotation.z = rotate_factor;
				donut.rotation.x = 0.5*Math.PI;
				donut.position.y = thickness;
				rotate_factor += arc_temp;
				
				donut_group.add(donut);
				}
			
			return donut_group;
		}

		function make_label(text,fontSize,fontHeight,font_path='helvetiker_regular.typeface.json',group,positionx,positiony,positionz,rotationx=0,rotationy=0,rotationz=0,fontColor=0x000000){
			
			let loader = new THREE.FontLoader();
			loader.load( font_path, function ( font ) {

				let textGeo = new THREE.TextGeometry( text, {

					font: font,
					size: fontSize,
					height: fontHeight,
					curveSegments: 11,
				} );
				
				let textMaterial = new THREE.MeshPhongMaterial( { color: fontColor} );

				let mesh = new THREE.Mesh( textGeo, textMaterial );
				mesh.castShadow = true;
				mesh.position.set(positionx,positiony,positionz)
				if (rotationx !=0){ mesh.rotation.x = rotationx };
				if (rotationy !=0){ mesh.rotation.y = rotationy };
				if (rotationz !=0){ mesh.rotation.z = rotationz };
				group.add( mesh );
				
			} );
		}


		
		//리턴시킬 그룹객체
		let group_start = new THREE.Group();
		let donut_group=read_array(data);
		group_start.add(donut_group);
		// 벽 그리기
		
		let wall = make_wall(radius,thickness);
		group_start.add(wall);
		

		let light = make_light(radius,thickness)
		group_start.add(light);
		

		let plane_bot = wall.children[0]
		group_start.Rotate_bot = function(camera){
			let x  = [camera.position.x,camera.position.z];
			plane_bot.rotation.y = Math.atan2(x[0],x[1]);
		}
		group_start.getInstancegroup=function(){ // 리얼타임 데이터
			return donut_group;
		}

		return group_start;
	}
}