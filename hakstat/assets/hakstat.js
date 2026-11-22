/*! 宗龍的台語課・學思達講義版面程式 © 2026 詹宗龍（臺中明道中學）。保留一切權利。 */
(function(){
  var d=document, sheets=[].slice.call(d.querySelectorAll('.sheet'));
  sheets.forEach(function(s){var w=d.createElement('div');w.className='wrap';s.parentNode.insertBefore(w,s);w.appendChild(s);});

  // 標題：整行不換行（「(一)」不會單獨落到下一行），太長就縮字
  function fitTitle(h){
    h.style.fontSize='';
    var fs=parseFloat(getComputedStyle(h).fontSize);
    for(var i=0;i<80;i++){
      if(h.scrollWidth<=h.clientWidth+1 && h.offsetHeight<=fs*1.25*1.45) break;
      fs-=0.5; h.style.fontSize=fs+'px';
    }
  }
  // 生份字表：一格放不下先縮字（最小 62%），仍放不下才折行
  function fitCells(s){
    [].forEach.call(s.querySelectorAll('.wt td.c'),function(td){
      var v=td.querySelector('.v'); if(!v) return;
      v.style.fontSize=''; td.style.whiteSpace='';
      var avail=td.clientWidth-5, w=v.offsetWidth;
      if(w>avail){ var r=avail/w; if(r>=0.8){ v.style.fontSize=(r*100)+'%'; } else { td.style.whiteSpace='normal'; } }
    });
  }
  // 造句表：每組第二列平分剩餘高度
  function fitRows(s){
    var st=s.querySelector('.st'); if(!st) return;
    var gb=[].slice.call(st.querySelectorAll('tr.gb'));
    gb.forEach(function(r){r.style.height='';});
    var H=s.querySelector('.stwrap').clientHeight, used=st.tHead?st.tHead.offsetHeight:0;
    [].forEach.call(st.querySelectorAll('tr.ga'),function(r){used+=r.offsetHeight;});
    var each=Math.max((H-used-2)/gb.length,10);
    gb.forEach(function(r){r.style.height=each+'px';});
  }
  function over(s){
    var inn=s.querySelector('.in');
    if(inn.scrollHeight>inn.clientHeight+1) return true;
    return [].some.call(inn.children,function(c){return c.offsetTop+c.offsetHeight>inn.clientHeight+1;});
  }
  // 整頁：內容太多就等比縮字，保證一節一張 A4
  function fit(s){
    var k=1; s.style.setProperty('--k','1');
    [].forEach.call(s.querySelectorAll('.fit'),fitTitle);
    fitCells(s);
    for(var i=0;i<30&&over(s);i++){ k-=0.02; s.style.setProperty('--k',k.toFixed(2)); fitCells(s); }
    fitRows(s);
    return {k:+k.toFixed(2),overflow:over(s)};
  }
  function scale(){
    var avail=d.getElementById('pages').clientWidth-16;
    sheets.forEach(function(s){
      var W=s.offsetWidth,H=s.offsetHeight,k=Math.min(avail/W,1.25);
      s.style.transform='scale('+k+')'; s.parentNode.style.width=(W*k)+'px'; s.parentNode.style.height=(H*k)+'px';
    });
  }
  function run(){
    var rep={k:1,overflow:false,sheets:[]};
    sheets.forEach(function(s){var r=fit(s); rep.sheets.push(r); rep.k=Math.min(rep.k,r.k); rep.overflow=rep.overflow||r.overflow;});
    scale(); window.HAK_REPORT=rep; window.HAK_READY=true;
  }
  var ready=[];
  if(d.fonts){ ready.push(d.fonts.load('16px "IansuiHak"','臺台語')); ready.push(d.fonts.ready); }
  Promise.all(ready).then(run,run);
  window.addEventListener('resize',function(){clearTimeout(scale.t);scale.t=setTimeout(scale,120);});

  // 下載 PDF：支援時跳「另存新檔」（預設桌面），否則一般下載
  var b=d.getElementById('dl'), tip=d.getElementById('tip');
  function say(t){tip.textContent=t;tip.hidden=false;clearTimeout(say.t);say.t=setTimeout(function(){tip.hidden=true;},2600);}
  function plain(){var a=d.createElement('a');a.href=HAK_PDF;a.download=HAK_NAME+'.pdf';d.body.appendChild(a);a.click();a.remove();say('已開始下載 PDF');}
  if(b) b.addEventListener('click',function(){
    if(b.classList.contains('busy')) return;
    var inFrame=false; try{inFrame=window.self!==window.top;}catch(e){inFrame=true;}
    if(!window.showSaveFilePicker||inFrame){plain();return;}
    var h;
    window.showSaveFilePicker({suggestedName:HAK_NAME+'.pdf',startIn:'desktop',types:[{description:'PDF 講義',accept:{'application/pdf':['.pdf']}}]})
    .then(function(x){h=x;b.classList.add('busy');return fetch(HAK_PDF);})
    .then(function(r){if(!r.ok)throw new Error(r.status);return r.blob();})
    .then(function(blob){return h.createWritable().then(function(w){return w.write(blob).then(function(){return w.close();});});})
    .then(function(){b.classList.remove('busy');say('已存檔：'+h.name);})
    .catch(function(err){b.classList.remove('busy');if(err&&err.name==='AbortError')return;plain();});
  });
})();
