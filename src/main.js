import {k} from "./KaboomCtx";
import { dialogueData, scaleFactor } from "./constants";
import { displayDialogue, setCamScale } from "./utils";
//https://www.youtube.com/watch?v=wy_fSStEgMs
k.loadSprite("spritesheet", "./spritesheet.png" , {
    sliceX: 39,
    sliceY: 31,
    anims: {
        "idle-down": 952,
        "walk-down": { from: 952, to: 955, loop: true, speed: 8 },
        "idle-side": 991,
        "walk-side": { from: 991, to: 994, loop: true, speed: 8 },
        "idle-up": 1030,
        "walk-up": { from: 1030, to: 1033, loop: true, speed: 8 },
      },
});

k.loadSprite("map" , "./mapv2.png");

k.setBackground(k.Color.fromHex("#311047"));

k.scene("main" , async () =>{
  //logical for scene
  const mapData = await (await fetch("./mapv2.json")).json();
  const layers = mapData.layers;

  const map = k.add([
    k.sprite("map"), // load map
    k.pos(0),
    k.scale(scaleFactor)
  ]);

  const player = k.make([
    k.sprite("spritesheet" , {anim:"idle-down"}),
    k.area({
      shape: new k.Rect(k.vec2(0,3) , 10 , 10)
    }),
    k.body(),
    k.anchor("center"),
    k.pos(),
    k.scale(scaleFactor), 
    {
      speed: 250,
      direction: "down",
      isInDialogue:false,
    },
    "player",
  ]);

  for (const layer of layers){
    if(layer.name === "boundaries"){
      for(const boundary of layer.objects){
          map.add([
            k.area({
              shape: new k.Rect(k.vec2(0), boundary.width , boundary.height),
            }),
            k.body({isStatic:true}),
            k.pos(boundary.x , boundary.y),
            boundary.name,
          ]);

          if(boundary.name){
            player.onCollide(boundary.name, () => {
              player.isInDialogue = true;
              displayDialogue(dialogueData[boundary.name] , () => { player.isInDialogue = false; });
            });
          }
      }
      continue;
    }
    //spawn Player
    if(layer.name === "spawnpoints"){
      for(const entity of layer.objects){
        if(entity.name === "player"){
          player.pos = k.vec2(
            (map.pos.x + entity.x ) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );
          k.add(player);
          continue;
        }
      }
    }
  }

  //camera
  setCamScale(k);

  k.onResize(() => {
    setCamScale(k);
  });

  k.onUpdate(() => {
    k.camPos(player.pos.x , player.pos.y + 100);
  });

  //Controls
  k.onMouseDown((mouseBtn) => {
    if(mouseBtn !== "left" || player.isInDialogue){
      return;
    }
    
    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos , player.speed);

    //player animation
    const mouseAngle = player.pos.angle(worldMousePos);

    const lowerBound = 50;
    const upperbonnd = 125;

    //Top
    if(
      mouseAngle > lowerBound &&
      mouseAngle < upperbonnd &&
      player.curAnim() !== "walk-up"
    ){
      player.play("walk-up");
      player.direction = "up";
      return;
    }
    //down
    if(
      mouseAngle < -lowerBound &&
      mouseAngle > -upperbonnd &&
      player.curAnim() !== "walk-down"
    ){
      player.play("walk-down");
      player.direction = "down";
      return;
    }

      //right
      if(Math.abs(mouseAngle) > upperbonnd){
        player.flipX = false;
        if(player.curAnim() !== "walk-side"){
          player.play("walk-side");
          player.direction = "right";
          return
        }
      }

      //left
      if(Math.abs(mouseAngle) < lowerBound){
        player.flipX = true;
        if(player.curAnim() !== "walk-side"){
          player.play("walk-side");
          player.direction = "left";
          return
        }
      }

      //stop
      k.onMouseRelease(() => {
        if(player.direction === "down"){
          player.play("idle-down");
          return;
        }
        if(player.direction === "up"){
          player.play("idle-up");
          return;
        }

        player.play("idle-side");
      });

  });
});

k.go("main");