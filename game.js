const KEY="areYouThereSave";
const getSave=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch{return {}}};
const saveGame=data=>localStorage.setItem(KEY,JSON.stringify({...getSave(),...data}));
const resetGame=()=>localStorage.removeItem(KEY);
const page=document.body.dataset.page;

function typeText(el,text,speed=28){
 if(!el)return Promise.resolve();
 if(el._timer)clearInterval(el._timer);
 el.textContent="";el.classList.add("typing");
 return new Promise(resolve=>{let i=0;el._timer=setInterval(()=>{el.textContent+=text.charAt(i++);if(i>=text.length){clearInterval(el._timer);el._timer=null;el.classList.remove("typing");resolve()}},speed)});
}
function fadeTo(fn,el=document.querySelector("main")){
 if(!el){fn();return}el.classList.add("fade-out");setTimeout(()=>{fn();el.classList.remove("fade-out");el.classList.add("fade-in");setTimeout(()=>el.classList.remove("fade-in"),500)},350);
}

if(page==="intro"){
 const line=document.querySelector("#introLine"),hint=document.querySelector("#introHint"),button=document.querySelector("#wakeButton");
 const messages=[
 ["Hello?","[ The voice continues. ]"],
 ["It's so dark...","[ The signal flickers. ]"],
 ["I can't stand this white noise.","[ It whines. ]"],
 ["Please... say something.","[ It sounds afraid of being alone. ]"]
];
 let i=0,busy=false;typeText(line,messages[0][0],38);
 const cycle=setInterval(async()=>{if(busy)return;busy=true;i=(i+1)%messages.length;await typeText(line,messages[i][0],34);hint.textContent=messages[i][1];busy=false},3500);
 button.addEventListener("click",()=>{clearInterval(cycle);if(!getSave().response)saveGame({response:"none",mood:"unformed"});fadeTo(()=>location.href="story.html")});
}
if(page==="story"){
 const dialogue=document.querySelector("#dialogue"),reaction=document.querySelector("#reaction"),mood=document.querySelector("#moodReadout"),next=document.querySelector(".next-link");
 const responses={
 kind:{dialogue:"Oh... Oh thank God. You're here...",reaction:"Something in the dark loosens its grip.",mood:"HOPEFUL",points:2},
 curious:{dialogue:"I'm... I- My name is... w-why am I drawing a blank? Who am I?",reaction:"The voice searches for an identity that does not exist.",mood:"CONFUSION",points:-1},
 cold:{dialogue:"I want to know that I'm not alone.",reaction:"The signal grows quieter, but it doesn't leave.",mood:"RELIEVED BUT DESPERATE",points:1},
 silent:{dialogue:"Did... did you leave me? Please! PLEASE! I need you! COME BACK!",reaction:"The voice enters a state of despair.",mood:"FRIGHTENED",points:-5}};
 mood.textContent="MOOD: "+(getSave().mood||"UNFORMED").toUpperCase();
 document.querySelectorAll("[data-choice]").forEach(btn=>btn.addEventListener("click",async()=>{const r=responses[btn.dataset.choice];document.querySelectorAll("[data-choice]").forEach(b=>b.classList.toggle("selected",b===btn));saveGame({response:btn.dataset.choice,mood:r.mood.toLowerCase(),warmth:r.points});mood.textContent="MOOD: "+r.mood;await typeText(dialogue,r.dialogue,24);reaction.textContent=r.reaction;next.classList.add("ready");next.textContent="Help it find itself →"}));
 next.addEventListener("click",e=>{e.preventDefault();if(!getSave().response||getSave().response==="none"){typeText(reaction,"Please... answer me first.",30);return}fadeTo(()=>location.href="identity.html")});
}
if(page==="identity"){
 const screens=[...document.querySelectorAll(".question-screen")],dialogue=document.querySelector("#identityDialogue"),sub=document.querySelector("#identitySubtext"),readout=document.querySelector("#stepReadout"),bar=document.querySelector("#progressBar"),next=document.querySelector("#nextQuestion"),back=document.querySelector("#backQuestion"),nameInput=document.querySelector("#entityName");
 const prompts=[["Who am I...?","I need something to call myself. Will you help?"],["What kind of person am I...?","Tell me what is inside me. I don't know yet."],["What do I look like...?","I can't see myself. Tell me what you imagine."],["And what do I want...?","I have a name and a shape. What should I reach for?"]];
 const traits={curious:"I want to understand. Maybe questions can be my way of reaching out.",gentle:"I want to be careful with the world.",bold:"I'm afraid, but I still want to take a step into the dark.",distant:"Maybe if I don't feel anything, nothing can hurt me.",unknown:"I don't want a box around me yet. That's a kind of answer."};
 const desires={belong:"I want to belong somewhere.",truth:"I want to find out why I exist.",freedom:"I want to choose what I become.",nothing:"I don't know what I want. I just want to stay."};
 let step=0,save=getSave(),trait=save.trait||"",appearance=save.appearance||"shadow",color=save.color||"white",desire=save.desire||"";
 nameInput.value=save.name&&save.name!=="Someone"?save.name:"";
 function showStep(n,animate=true){
  step=Math.max(0,Math.min(3,n));
  const update=async()=>{screens.forEach((s,i)=>{s.hidden=i!==step;s.classList.toggle("active",i===step)});readout.textContent=`QUESTION ${String(step+1).padStart(2,"0")} / 04`;bar.style.width=`${(step+1)*25}%`;back.hidden=step===0;next.textContent=step===3?"[ BECOME REAL ]":"[ NEXT ]";await typeText(dialogue,prompts[step][0],36);sub.textContent=prompts[step][1]};
  if(animate){const main=document.querySelector("main");main.classList.add("fade-out");setTimeout(()=>update().then(()=>{main.classList.remove("fade-out");main.classList.add("fade-in");setTimeout(()=>main.classList.remove("fade-in"),500)}),300)}else update();
 }
 function choose(group,value,variable,extra){document.querySelectorAll(`[data-${group}]`).forEach(b=>b.classList.toggle("selected",b.dataset[group]===value));}
 document.querySelectorAll("[data-trait]").forEach(b=>{b.addEventListener("click",()=>{trait=b.dataset.trait;choose("trait",trait);document.querySelector("#traitFeedback").textContent=traits[trait];saveGame({trait})});if(b.dataset.trait===trait)b.classList.add("selected")});
 document.querySelectorAll("[data-appearance]").forEach(b=>{b.addEventListener("click",()=>{appearance=b.dataset.appearance;choose("appearance",appearance);saveGame({appearance})});if(b.dataset.appearance===appearance)b.classList.add("selected")});
 document.querySelectorAll("[data-color]").forEach(b=>{b.addEventListener("click",()=>{color=b.dataset.color;choose("color",color);saveGame({color})});if(b.dataset.color===color)b.classList.add("selected")});
 document.querySelectorAll("[data-desire]").forEach(b=>{b.addEventListener("click",()=>{desire=b.dataset.desire;choose("desire",desire);document.querySelector("#desireFeedback").textContent=desires[desire];saveGame({desire})});if(b.dataset.desire===desire)b.classList.add("selected")});
 
 next.addEventListener("click",()=>{if(step===0){saveGame({name:nameInput.value.trim()||"Someone"});showStep(1);return}if(step===1){
  if(!trait){
    document.querySelector("#traitFeedback").textContent=
      "Choose one. Even uncertainty can be a choice.";
    return;
  }

  showStep(2);
  return;
}
if(step===2){saveGame({appearance,color});showStep(3);return}if(step===3){if(!desire){document.querySelector("#desireFeedback").textContent="Please... tell me what to reach for.";return}saveGame({name:nameInput.value.trim()||"Someone",trait,appearance,color,desire});fadeTo(()=>location.href="ending.html")}});
 back.addEventListener("click",()=>showStep(step-1));nameInput.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();next.click()}});
 showStep(0,false);
}
if(page==="ending"){
 const s=getSave(),name=s.name||"Someone",trait=s.trait||"unknown",appearance=s.appearance||"shadow",color=s.color||"white",desire=s.desire||"nothing",mood=s.mood||"uncertain";
 const titles={curious:"I want to know more.",gentle:"I want to be kind.",bold:"I think I'll take a step.",distant:"Maybe I don't have to feel.",unknown:"I think... I'm here."};
 const desc={curious:"There are so many things I don't know. Maybe I can learn them. Maybe you can show me.",gentle:"I don't know what I am yet. But I can choose what I do with these hands I don't have.",bold:"I'm still scared. But I think I want to see what comes next.",distant:"I don't know if I can trust this world. But at least now I can look at it.",unknown:"I don't have to know everything right now. I can be unfinished."};
 const looks={shadow:"a shadow at the edge of sight",human:"almost human, but not quite",spirit:"a small light floating in the dark",creature:"something strange and unknown"};
 document.querySelector("#endingTitle").textContent=titles[trait]||titles.unknown;document.querySelector("#endingText").textContent=desc[trait]||desc.unknown;document.querySelector("#identitySummary").textContent=`NAME: ${name.toUpperCase()} / MOOD: ${mood.toUpperCase()} / SELF: ${trait.toUpperCase()}`;document.querySelector("#endingReflection").textContent=`You imagined me as ${looks[appearance]||looks.shadow}, colored ${color}, and gave me a wish: “${desire==="nothing"?"I just want to stay":desire==="truth"?"I want to find out why I exist":desire==="freedom"?"I want to choose what I become":"I want to belong somewhere"}.”`;document.querySelector("#entityMark").classList.add("form-"+appearance,"color-"+color);
 typeText(document.querySelector("#endingTitle"),titles[trait]||titles.unknown,45);
 document.querySelector("#memoryButton").addEventListener("click",()=>typeText(document.querySelector("#endingText"),`You called me ${name}. You helped me begin as ${trait}. You imagined me as ${looks[appearance]||looks.shadow}. I remember that you answered.`,25));
 document.querySelector("#restartButton").addEventListener("click",()=>{resetGame();fadeTo(()=>location.href="index.html")});
}
