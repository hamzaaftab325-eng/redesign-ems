(() => {
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const animated=typeof gsap!=='undefined'&&typeof ScrollTrigger!=='undefined'&&!reduced;
const desktopQuery='(min-width: 1101px) and (min-height: 620px)';
const menu=$('#menu'),menuButton=$('.menu-toggle'),cards=$$('.service-card'),lane=$('.service-panels');
let lenis,master,railTrigger,activeService=0,menuTween,menuClosing=false;
let chapterTimes={},serviceTimes=[];
const headerBrand=$('.header .brand');
const brandSurfaces=$$('.hero,.impact,.contact,.services-intro');
function updateBrandContrast(){
 const logo=headerBrand.getBoundingClientRect();let surface='original';
 for(const section of brandSurfaces){
  const r=section.getBoundingClientRect();
  if(r.left<logo.right&&r.right>logo.left&&r.top<logo.bottom&&r.bottom>logo.top){surface=section.classList.contains('services-intro')?'yellow':'blue';break;}
 }
 if(headerBrand.dataset.surface!==surface)headerBrand.dataset.surface=surface;
}
let brandFrame=0;
function scheduleBrandContrast(){if(!brandFrame)brandFrame=requestAnimationFrame(()=>{brandFrame=0;updateBrandContrast();});}
window.addEventListener('scroll',scheduleBrandContrast,{passive:true});
window.addEventListener('resize',scheduleBrandContrast,{passive:true});
updateBrandContrast();

const logoObserver=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('is-visible',e.isIntersecting)),{rootMargin:'100px'});
logoObserver.observe($('.logo-marquees'));
function closeMenu(done){
 if(!menu.open){done?.();return;}if(menuClosing)return;menuClosing=true;
 const finish=()=>{menu.close();menuClosing=false;menuButton.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');lenis?.start();menuButton.focus({preventScroll:true});done?.();};
 if(animated){menuTween?.kill();menuTween=gsap.to(menu,{clipPath:'inset(0 0 0 100%)',duration:.55,ease:'power3.inOut',onComplete:finish});}else finish();
}
menuButton.addEventListener('click',()=>{if(menu.open)return;menu.showModal();menuButton.setAttribute('aria-expanded','true');document.body.classList.add('menu-open');lenis?.stop();if(animated){menuTween?.kill();menuTween=gsap.timeline().fromTo(menu,{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:.8,ease:'power3.inOut'}).fromTo($('.menu-image'),{clipPath:'inset(0 0 0 100%)'},{clipPath:'inset(0 0 0 0)',duration:.9,ease:'power3.out'},.2).fromTo($$('.menu nav a'),{y:55,opacity:0},{y:0,opacity:1,stagger:.075,duration:.7,ease:'power3.out'},.32);}});
$('.menu-close').addEventListener('click',()=>closeMenu());menu.addEventListener('cancel',e=>{e.preventDefault();closeMenu();});
function scrollToPosition(top){if(lenis)lenis.scrollTo(top,{duration:1.15,easing:t=>1-Math.pow(1-t,4)});else window.scrollTo({top,behavior:reduced?'instant':'smooth'});}
function timeToScroll(time){return railTrigger.start+time/master.duration()*(railTrigger.end-railTrigger.start);}
function goTo(id){const el=$(id);if(!el)return;let top=el.getBoundingClientRect().top+scrollY-90;if(railTrigger&&chapterTimes[id]!==undefined)top=timeToScroll(chapterTimes[id]);if(id==='#home')top=0;scrollToPosition(Math.max(0,top));}
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href');if(!$(id))return;e.preventDefault();closeMenu(()=>goTo(id));}));
function updateActive(index){activeService=index;$('.stage-counter').textContent=`0${index+1} / 05`;cards.forEach((card,i)=>{const on=i===index;card.classList.toggle('is-active',on);$('.service-tab',card).setAttribute('aria-expanded',String(on));$('.service-caption',card).inert=!!railTrigger&&!on;});$('.stage-prev').disabled=index===0;$('.stage-next').disabled=index===cards.length-1;}
function chooseService(index){index=Math.max(0,Math.min(cards.length-1,index));if(railTrigger)scrollToPosition(timeToScroll(serviceTimes[index]+.9));else if(innerWidth>600){lane.scrollTo({left:cards[index].offsetLeft-lane.offsetLeft,behavior:reduced?'instant':'smooth'});updateActive(index);}else cards[index].scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});}
$$('[data-service]').forEach(b=>b.addEventListener('click',()=>chooseService(+b.dataset.service)));$('.stage-prev').addEventListener('click',()=>chooseService(activeService-1));$('.stage-next').addEventListener('click',()=>chooseService(activeService+1));
lane.addEventListener('scroll',()=>{if(railTrigger)return;const r=lane.getBoundingClientRect();const i=cards.reduce((best,c,j)=>Math.abs(c.getBoundingClientRect().left-r.left)<Math.abs(cards[best].getBoundingClientRect().left-r.left)?j:best,0);updateActive(i);},{passive:true});
let chosenValue=-1;
$$('.values-list button').forEach((button,i)=>{const select=()=>{if(chosenValue===i)return;chosenValue=i;const pic=$('.values-follow img');const swap=()=>{pic.src=button.dataset.image;$('.values-copy').textContent=button.dataset.copy;};if(animated){gsap.killTweensOf([pic,$('.values-copy')]);gsap.to(pic,{clipPath:'inset(0 0 100% 0)',scale:1.08,duration:.22,ease:'power2.in',onComplete:()=>{swap();gsap.fromTo(pic,{clipPath:'inset(100% 0 0 0)',scale:1.65},{clipPath:'inset(0 0 0 0)',scale:1,duration:1.25,ease:'power3.out'});}});gsap.fromTo($('.values-copy'),{opacity:.3,y:8},{opacity:1,y:0,duration:.6,delay:.2,ease:'power3.out'});}else swap();};button.addEventListener('mouseenter',select);button.addEventListener('focus',select);button.addEventListener('click',select);});
updateActive(0);
if(!animated){$('.loader')?.remove();return;}
gsap.registerPlugin(ScrollTrigger);gsap.config({nullTargetWarn:false});ScrollTrigger.config({ignoreMobileResize:true});document.body.classList.add('motion');
const heroChars=[];
function splitChars(el){const text=el.textContent;el.setAttribute('aria-label',text);el.replaceChildren();text.split(/(\s+)/).forEach(word=>{if(/^\s+$/.test(word)){el.append(document.createTextNode(word));return;}const wrap=document.createElement('span');wrap.className='word';wrap.setAttribute('aria-hidden','true');[...word].forEach(c=>{const span=document.createElement('span');span.className='char';span.textContent=c;wrap.append(span);});el.append(wrap);});return $$('.char',el);}
$$('.hero-line').forEach(el=>heroChars.push(splitChars(el)));
// Preserve emphasis and line breaks while animating the actual letters behind masks.
$$('.reveal-title').forEach(el=>{const lines=el.innerHTML.split(/<br\s*\/?\s*>/i);const label=el.textContent;el.innerHTML=lines.map(line=>`<span class="title-line" aria-hidden="true">${line}</span>`).join('');el.setAttribute('aria-label',label);$$('.title-line',el).forEach(line=>{const walker=document.createTreeWalker(line,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(node=>{const fragment=document.createDocumentFragment();node.textContent.split(/(\s+)/).forEach(word=>{if(/^\s+$/.test(word)){fragment.append(document.createTextNode(word));return;}const wrap=document.createElement('span');wrap.className='word';[...word].forEach(c=>{const span=document.createElement('span');span.className='char';span.textContent=c;wrap.append(span);});fragment.append(wrap);});node.replaceWith(fragment);});});});
// Reveal text once, independently of the reversible media timeline.
// Explicit final values prevent refresh/invalidation from capturing hidden transforms.
function revealTitle(el){
 if(el.dataset.revealed)return;
 el.dataset.revealed='true';
 const chars=$$('.char',el);
 const tl=gsap.timeline({onComplete:()=>gsap.set(chars,{clearProps:'transform,opacity,visibility'})});
 $$('.title-line',el).forEach((line,i)=>tl.fromTo($$('.char',line),
  {yPercent:i%2?-105:105},
  {yPercent:0,duration:.65,stagger:.025,ease:'power3.out',immediateRender:false},i*.08));
}
const titleObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
 if(entry.isIntersecting){revealTitle(entry.target);titleObserver.unobserve(entry.target);}
}),{threshold:.12});
const mm=gsap.matchMedia();
function setupMotion(){
 mm.add(desktopQuery,()=>{
  const W=()=>innerWidth,track=$('.track'),stage=$('.service-stage'),work=$('.work-stage');
  if(typeof Lenis!=='undefined'){lenis=new Lenis({lerp:.075,smoothWheel:true});lenis.on('scroll',ScrollTrigger.update);}
  const tick=t=>lenis?.raf(t*1000);gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0);
  // Reference proportions: narrow 15vw apertures grow to 60vw; media settles to 66.66vh.
  // Fixed outer geometry keeps all triggers stable while the inner gallery changes width.
  const narrow=.15,wide=.60,gap=.025,step=wide+gap;
  cards.forEach((card,i)=>{
   gsap.set(card,{x:()=>i*(narrow+gap)*W(),width:()=>narrow*W()});
   gsap.set($('.service-visual',card),{height:'87vh'});
   gsap.set($('.service-photo',card),{scale:1.2});
   gsap.set($('.service-meta',card),{autoAlpha:0,y:12});
   gsap.set($('.service-caption',card),{autoAlpha:0,y:28});
   gsap.set($('.service-tab',card),{autoAlpha:1});
  });
  master=gsap.timeline({defaults:{ease:'none'}});
  const approach=(stage.offsetLeft/W())-.65;
  master.to(track,{x:()=>-stage.offsetLeft+.65*W(),duration:approach},0);
  serviceTimes=[];
  cards.forEach((card,i)=>{
   const at=approach+i*1.2;serviceTimes.push(at);
   master.to(track,{x:()=>-stage.offsetLeft-(i*step-.12)*W(),duration:1.2},at);
   master.to(card,{width:()=>wide*W(),duration:1,ease:'power1.inOut'},at);
   cards.slice(i+1).forEach((next,j)=>master.to(next,{x:()=>((i+1)*step+j*(narrow+gap))*W(),duration:1,ease:'power1.inOut'},at));
   master.to($('.service-visual',card),{height:()=>Math.min(innerHeight*.6666,innerHeight-270),duration:1,ease:'power1.inOut'},at);
   master.to($('.service-photo',card),{scale:1,duration:1.2,ease:'power2.out'},at);
   master.to($('.service-tab',card),{autoAlpha:0,duration:.25},at+.2);
   master.to($('.service-meta',card),{autoAlpha:1,y:0,duration:.33,ease:'power2.out'},at+.45);
   master.to($('.service-caption',card),{autoAlpha:1,y:0,duration:.5,ease:'power3.out'},at+.6);
  });
  const serviceEnd=approach+cards.length*1.2;
  const lastX=stage.offsetLeft+(4*step-.12)*W();
  const toWork=(work.offsetLeft-lastX)/W();
  master.to(track,{x:()=>-work.offsetLeft,duration:toWork},serviceEnd);
  const workAt=serviceEnd+toWork,workDwell=2.7;
  master.fromTo('.work-gallery',{width:'60%'},{width:'42.5%',duration:1,ease:'power1.inOut'},workAt);
  master.fromTo('.work-copy',{xPercent:30,opacity:1},{xPercent:0,opacity:1,duration:.8,ease:'power2.out'},workAt+.45);
  master.fromTo('.work-stack',{y:0},{y:()=>-innerHeight*.125,duration:workDwell,ease:'none'},workAt);
  master.fromTo('.work-tile',{height:'66vh'},{height:'37.5vh',duration:1.3,ease:'power1.inOut'},workAt);
  master.fromTo('.work-tile img',{scale:1.15},{scale:1,duration:workDwell,ease:'none'},workAt);

  const finalDistance=()=>track.scrollWidth-W(),tail=(finalDistance()-work.offsetLeft)/W();
  master.to(track,{x:()=>-finalDistance(),duration:tail},workAt+workDwell);
  const travelTime=workAt+workDwell+tail;
  chapterTimes={'#home':0,'#about':$('.about').offsetLeft/W(),'#services':$('.services-intro').offsetLeft/W(),'#work':workAt+1.2,'#impact':travelTime};
  master.fromTo('.hero-photo',{xPercent:-12,scale:1.15},{xPercent:0,scale:1,duration:1.5},.1);
  
  const valAt=$('.values').offsetLeft/W();
  $$('.values-list button').forEach((el,i)=>master.fromTo(el,{x:i===1?'4vw':'-4vw'},{x:i===1?'-3vw':i===2?'10vw':'5vw',duration:1.6},valAt-.8));
  master.fromTo('.about-copy',{opacity:.15},{opacity:1,duration:.65},chapterTimes['#about']-.45);
  railTrigger=ScrollTrigger.create({animation:master,trigger:'.journey',pin:true,start:'top top',end:()=>'+='+travelTime*W(),scrub:1,anticipatePin:1,invalidateOnRefresh:true,onUpdate:self=>{gsap.set('.journey-progress>span',{scaleX:self.progress});scheduleBrandContrast();},onRefresh:()=>updateActive(activeService)});
  animateCounts({trigger:'.journey',start:()=>railTrigger.start+(travelTime-.65)/travelTime*(railTrigger.end-railTrigger.start)});
  master.eventCallback('onUpdate',()=>{scheduleBrandContrast();let index=0;serviceTimes.forEach((at,i)=>{if(master.time()>=at+.4)index=i;});if(index!==activeService)updateActive(index);});
  updateActive(0);
  return()=>{gsap.ticker.remove(tick);lenis?.destroy();lenis=null;railTrigger=null;master=null;chapterTimes={};cards.forEach(card=>$('.service-caption',card).inert=false);updateActive(0);};
 });
 mm.add('(max-width: 1100px), (max-height: 619px)',()=>{
  cards.forEach(c=>$('.service-caption',c).inert=false);

  gsap.fromTo('.hero-photo',{yPercent:-7,scale:1.08},{yPercent:0,scale:1,ease:'none',scrollTrigger:{trigger:'.image-panel',start:'top bottom',end:'bottom top',scrub:.6}});
  if(innerWidth<=600){cards.forEach(card=>{const media=$('.service-visual',card),pic=$('.service-photo',card);const tl=gsap.timeline({scrollTrigger:{trigger:media,start:'top 95%',end:'bottom 5%',scrub:.45}});tl.fromTo(media,{clipPath:'inset(50% 0% 50% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.4,ease:'power2.out'},0).to(media,{clipPath:'inset(16% 0% 0% 0%)',duration:.25,ease:'power2.in'},.75).fromTo(pic,{scale:1.2,yPercent:-5},{scale:1,yPercent:0,duration:1,ease:'none'},0);});}

  $$('.work-tile').forEach(tile=>gsap.fromTo($('img',tile),{yPercent:-10,scale:1.15},{yPercent:0,scale:1,ease:'none',scrollTrigger:{trigger:tile,start:'top bottom',end:'bottom top',scrub:.25}}));
  animateCounts({trigger:'.stats',start:'top 85%'});
 });
 mm.add('(hover: hover) and (pointer: fine)',()=>{
  const cursor=$('.cursor'),x=gsap.quickTo(cursor,'x',{duration:.22,ease:'power3.out'}),y=gsap.quickTo(cursor,'y',{duration:.22,ease:'power3.out'});
  const move=e=>{x(e.clientX);y(e.clientY);};window.addEventListener('pointermove',move,{passive:true});
  const clean=[];$$('[data-cursor]').forEach(el=>{const enter=()=>{gsap.to(cursor,{width:72,height:72,duration:.4,ease:'power3.out'});gsap.to('.cursor span',{opacity:1,duration:.25});};const leave=()=>{gsap.to(cursor,{width:9,height:9,duration:.35});gsap.to('.cursor span',{opacity:0,duration:.15});};el.addEventListener('pointerenter',enter);el.addEventListener('pointerleave',leave);clean.push(()=>{el.removeEventListener('pointerenter',enter);el.removeEventListener('pointerleave',leave);});});
  const values=$('.values'),follow=$('.values-follow');const fx=gsap.quickTo(follow,'x',{duration:.55,ease:'power3.out'}),fy=gsap.quickTo(follow,'y',{duration:.55,ease:'power3.out'});
  const valMove=e=>{const r=values.getBoundingClientRect();fx(Math.max(20,Math.min(r.width-280,e.clientX-r.left-130)));fy(Math.max(100,Math.min(r.height-350,e.clientY-r.top-162)));};const valIn=()=>gsap.to(follow,{opacity:.7,scale:1,duration:.4});const valOut=()=>gsap.to(follow,{opacity:0,scale:.93,duration:.4});
  values.addEventListener('pointermove',valMove);values.addEventListener('pointerenter',valIn);values.addEventListener('pointerleave',valOut);
  return()=>{window.removeEventListener('pointermove',move);clean.forEach(fn=>fn());values.removeEventListener('pointermove',valMove);values.removeEventListener('pointerenter',valIn);values.removeEventListener('pointerleave',valOut);};
 });
 // The closing image opens from right to left, and closes on reverse scroll.
 gsap.timeline({scrollTrigger:{trigger:'.closing-image',start:'top 60%',end:'bottom 40%',scrub:.33}})
 .to('.closing-front',{clipPath:'inset(0% 100% 0% 0%)',duration:1.5,ease:'power2.out'},0)
 .fromTo('.closing-back',{scale:1.2},{scale:1,duration:2,ease:'power2.out'},0)
 .fromTo('.closing-caption span',{yPercent:110},{yPercent:0,duration:.6,stagger:.12,ease:'power3.out'},.7);
 $$('.reveal-title').forEach(el=>titleObserver.observe(el));
 $$('.contact-title>span').forEach((el,i)=>gsap.fromTo(el,{yPercent:i%2?-15:15},{yPercent:0,opacity:1,ease:'none',scrollTrigger:{trigger:'.contact',start:'top 90%',end:'center 70%',scrub:.7}}));
 gsap.fromTo('.footer-brand',{y:24},{y:0,opacity:1,duration:1,ease:'power3.out',scrollTrigger:{trigger:'footer',start:'top 95%'}});
 $$('a.roll').forEach(el=>{if(el.children.length)return;const text=el.textContent;el.textContent='';el.setAttribute('aria-label',text);const wrap=document.createElement('span');wrap.className='roll-inner';const a=document.createElement('span'),b=document.createElement('span');a.textContent=b.textContent=text;b.className='roll-copy';a.setAttribute('aria-hidden','true');b.setAttribute('aria-hidden','true');wrap.append(a,b);el.append(wrap);const ac=splitChars(a),bc=splitChars(b);gsap.set(bc,{yPercent:110});const hover=on=>{gsap.to(ac,{yPercent:on?-110:0,duration:.45,stagger:.012,ease:'power2.inOut',overwrite:true});gsap.to(bc,{yPercent:on?0:110,duration:.45,stagger:.012,ease:'power2.inOut',overwrite:true});};el.addEventListener('pointerenter',()=>hover(true));el.addEventListener('pointerleave',()=>hover(false));});
 ScrollTrigger.refresh();
}
function animateCounts(trigger){$$('[data-count]').forEach(el=>{const value={n:0};gsap.to(value,{n:+el.dataset.count,duration:1.4,ease:'power2.out',onUpdate:()=>el.textContent=(el.dataset.prefix||'')+Math.round(value.n)+(el.dataset.suffix||''),scrollTrigger:trigger});});}
let started=false;const progress={n:0};let progressTween=gsap.to(progress,{n:95,duration:1.1,ease:'power2.out',onUpdate:()=>{if($('.loader-number'))$('.loader-number').textContent=Math.round(progress.n)+'%';if($('.loader-bar'))gsap.set('.loader-bar',{width:progress.n+'%'});}});
function reveal(){if(started)return;started=true;progressTween.kill();setupMotion();lenis?.stop();const tl=gsap.timeline({onComplete:()=>lenis?.start()});tl.to('.loader-bar',{width:'100%',duration:.2,onStart:()=>{$('.loader-number').textContent='100%';}}).to('.loader',{yPercent:-100,duration:.85,ease:'power3.inOut',onComplete:()=>$('.loader')?.remove()},'+=.1');heroChars.forEach((list,i)=>tl.fromTo(list,{yPercent:i%2?-112:112},{yPercent:0,duration:.75,stagger:.025,ease:'power3.out'},.55+i*.14));tl.from('.hero-bottom>*',{y:25,opacity:0,duration:.8,stagger:.08,ease:'power3.out'},1).from('.hero-top,.hero .panel-bottom',{opacity:0,duration:.6},1.2);}
Promise.race([Promise.all([document.fonts.ready,...$$('.hero img,.image-panel img').map(im=>im.complete?Promise.resolve():new Promise(resolve=>{im.addEventListener('load',resolve,{once:true});im.addEventListener('error',resolve,{once:true});}))]),new Promise(resolve=>setTimeout(resolve,2200))]).then(()=>setTimeout(reveal,200));
})();
