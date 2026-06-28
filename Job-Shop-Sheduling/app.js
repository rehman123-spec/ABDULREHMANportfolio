/* JOB SHOP SCHEDULING — PSO ENGINE */
let jobsData=[], activeMachineNames={};
const JOB_COLORS=['#f97316','#3b82f6','#22c55e','#a855f7','#ef4444','#06b6d4','#eab308','#ec4899','#14b8a6','#f43f5e','#8b5cf6','#84cc16','#fb923c','#2dd4bf','#f472b6','#facc15','#38bdf8','#a3e635','#c084fc','#fb7185'];
const $=id=>document.getElementById(id);
const jobsContainer=$('jobsContainer'),previewTable=$('previewBody'),previewStats=$('previewStats'),dataPreview=$('dataPreview'),runBtn=$('runBtn');

// TABS
document.querySelectorAll('.tab-btn').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));btn.classList.add('active');$(btn.dataset.tab+'Tab').classList.add('active');});});

// PRESETS
const PRESETS={
furniture:{name:'Custom Furniture Workshop',machines:{1:'Cutting',2:'Sanding',3:'Assembly',4:'Painting',5:'QC Check'},jobs:[
{id:1,operations:[{machine:1,duration:12},{machine:2,duration:8},{machine:3,duration:15},{machine:4,duration:10},{machine:5,duration:5}]},
{id:2,operations:[{machine:1,duration:10},{machine:3,duration:18},{machine:2,duration:6},{machine:4,duration:12},{machine:5,duration:4}]},
{id:3,operations:[{machine:2,duration:7},{machine:1,duration:14},{machine:4,duration:9},{machine:3,duration:16},{machine:5,duration:6}]},
{id:4,operations:[{machine:1,duration:11},{machine:2,duration:9},{machine:3,duration:20},{machine:5,duration:5},{machine:4,duration:8}]},
{id:5,operations:[{machine:3,duration:13},{machine:1,duration:10},{machine:2,duration:7},{machine:4,duration:11},{machine:5,duration:4}]}
]},
ev_battery:{name:'EV Battery Pack Assembly',machines:{1:'Cell Sort',2:'Welding',3:'BMS Wire',4:'Thermal',5:'Leak Test'},jobs:[
{id:1,operations:[{machine:1,duration:8},{machine:2,duration:14},{machine:3,duration:10},{machine:4,duration:12},{machine:5,duration:6}]},
{id:2,operations:[{machine:1,duration:9},{machine:3,duration:11},{machine:2,duration:13},{machine:4,duration:10},{machine:5,duration:7}]},
{id:3,operations:[{machine:2,duration:12},{machine:1,duration:7},{machine:4,duration:14},{machine:3,duration:9},{machine:5,duration:8}]},
{id:4,operations:[{machine:1,duration:10},{machine:2,duration:15},{machine:4,duration:11},{machine:3,duration:8},{machine:5,duration:6}]},
{id:5,operations:[{machine:3,duration:9},{machine:1,duration:8},{machine:2,duration:11},{machine:4,duration:13},{machine:5,duration:7}]},
{id:6,operations:[{machine:1,duration:7},{machine:4,duration:10},{machine:2,duration:14},{machine:3,duration:12},{machine:5,duration:5}]}
]},
aerospace:{name:'Aerospace CNC Machining',machines:{1:'Milling',2:'Turning',3:'Heat Treat',4:'Grinding',5:'Inspect',6:'Coating'},jobs:[
{id:1,operations:[{machine:1,duration:18},{machine:2,duration:12},{machine:3,duration:25},{machine:4,duration:10},{machine:5,duration:8},{machine:6,duration:14}]},
{id:2,operations:[{machine:2,duration:15},{machine:1,duration:20},{machine:3,duration:22},{machine:5,duration:7},{machine:4,duration:11},{machine:6,duration:12}]},
{id:3,operations:[{machine:1,duration:16},{machine:3,duration:28},{machine:2,duration:10},{machine:4,duration:14},{machine:6,duration:11},{machine:5,duration:9}]},
{id:4,operations:[{machine:2,duration:14},{machine:1,duration:22},{machine:4,duration:12},{machine:3,duration:20},{machine:5,duration:8},{machine:6,duration:13}]},
{id:5,operations:[{machine:1,duration:19},{machine:2,duration:11},{machine:3,duration:24},{machine:4,duration:9},{machine:6,duration:15},{machine:5,duration:7}]}
]},
textile:{name:'Textile & Garment Production',machines:{1:'Weaving',2:'Dyeing',3:'Cutting',4:'Stitching',5:'Finishing',6:'Packing'},jobs:[
{id:1,operations:[{machine:1,duration:10},{machine:2,duration:15},{machine:3,duration:8},{machine:4,duration:20},{machine:5,duration:6},{machine:6,duration:4}]},
{id:2,operations:[{machine:1,duration:12},{machine:2,duration:14},{machine:3,duration:7},{machine:4,duration:18},{machine:5,duration:5},{machine:6,duration:3}]},
{id:3,operations:[{machine:2,duration:16},{machine:1,duration:11},{machine:3,duration:9},{machine:4,duration:22},{machine:5,duration:7},{machine:6,duration:4}]},
{id:4,operations:[{machine:1,duration:9},{machine:3,duration:6},{machine:2,duration:13},{machine:4,duration:19},{machine:5,duration:8},{machine:6,duration:5}]},
{id:5,operations:[{machine:1,duration:11},{machine:2,duration:12},{machine:3,duration:10},{machine:4,duration:21},{machine:5,duration:6},{machine:6,duration:3}]},
{id:6,operations:[{machine:3,duration:8},{machine:1,duration:10},{machine:2,duration:14},{machine:4,duration:17},{machine:5,duration:5},{machine:6,duration:4}]}
]},
ft06:{name:'FT06 Standard Benchmark',machines:{1:'M1',2:'M2',3:'M3',4:'M4',5:'M5',6:'M6'},jobs:[
{id:1,operations:[{machine:3,duration:1},{machine:1,duration:3},{machine:2,duration:6},{machine:4,duration:7},{machine:6,duration:3},{machine:5,duration:6}]},
{id:2,operations:[{machine:2,duration:8},{machine:3,duration:5},{machine:5,duration:10},{machine:6,duration:10},{machine:1,duration:10},{machine:4,duration:4}]},
{id:3,operations:[{machine:3,duration:5},{machine:4,duration:4},{machine:6,duration:8},{machine:1,duration:9},{machine:2,duration:1},{machine:5,duration:7}]},
{id:4,operations:[{machine:2,duration:5},{machine:1,duration:5},{machine:3,duration:5},{machine:4,duration:3},{machine:5,duration:8},{machine:6,duration:9}]},
{id:5,operations:[{machine:3,duration:9},{machine:2,duration:3},{machine:5,duration:5},{machine:6,duration:4},{machine:1,duration:3},{machine:4,duration:1}]},
{id:6,operations:[{machine:2,duration:3},{machine:4,duration:3},{machine:6,duration:9},{machine:1,duration:10},{machine:5,duration:4},{machine:3,duration:1}]}
]}};

$('presetSelect').onchange=e=>{const k=e.target.value;if(!k)return;const p=PRESETS[k];activeMachineNames=Object.assign({},p.machines);jobsContainer.innerHTML='';jobCounter=0;p.jobs.forEach(j=>addJob(j.operations.map(o=>o.machine),j.operations.map(o=>o.duration)));$('presetHint').textContent='✓ Loaded: '+p.name;$('presetHint').className='preset-hint loaded';$('tabManual').click();};

// MANUAL INPUT
let jobCounter=0;
function addJob(mv,dv){jobCounter++;const jid=jobCounter,card=document.createElement('div');card.className='job-card';card.dataset.jid=jid;const ops=mv||[''],durs=dv||[''];
card.innerHTML=`<div class="job-header"><span class="job-title">Job ${jid}</span><div class="job-actions"><button class="btn btn-xs btn-accent add-op-btn">+ Op</button><button class="btn btn-xs btn-danger remove-job-btn">✕</button></div></div><div class="ops-list">${ops.map((m,i)=>opRowHTML(i+1,m,durs[i]||'')).join('')}</div>`;
jobsContainer.appendChild(card);
card.querySelector('.add-op-btn').onclick=()=>{const list=card.querySelector('.ops-list'),idx=list.children.length+1;list.insertAdjacentHTML('beforeend',opRowHTML(idx,'',''));bindOpRemove(card);syncFromManual();};
card.querySelector('.remove-job-btn').onclick=()=>{card.remove();syncFromManual();};
bindOpRemove(card);card.querySelectorAll('.op-input').forEach(inp=>inp.addEventListener('input',syncFromManual));syncFromManual();}

function opRowHTML(idx,machine,duration){return`<div class="op-row"><span class="op-label">O${idx}</span><input class="op-input" type="number" placeholder="Machine" min="1" value="${machine}"><input class="op-input" type="number" placeholder="Duration" min="1" value="${duration}"><button class="btn btn-xs btn-danger remove-op-btn" title="Remove">✕</button></div>`;}

function bindOpRemove(card){card.querySelectorAll('.remove-op-btn').forEach(btn=>{btn.onclick=()=>{if(card.querySelectorAll('.op-row').length>1){btn.closest('.op-row').remove();syncFromManual();}};});card.querySelectorAll('.op-input').forEach(inp=>inp.addEventListener('input',syncFromManual));}

function syncFromManual(){jobsData=[];document.querySelectorAll('.job-card').forEach((card,ji)=>{const ops=[];card.querySelectorAll('.op-row').forEach(row=>{const inputs=row.querySelectorAll('.op-input');const m=parseInt(inputs[0].value),d=parseInt(inputs[1].value);if(m>0&&d>0)ops.push({machine:m,duration:d});});if(ops.length>0)jobsData.push({id:ji+1,operations:ops});});updatePreview();}
$('addJobBtn').onclick=()=>addJob();

// CSV
const dropZone=$('dropZone'),csvInput=$('csvFileInput');
dropZone.onclick=()=>csvInput.click();
dropZone.ondragover=e=>{e.preventDefault();dropZone.classList.add('dragover');};
dropZone.ondragleave=()=>dropZone.classList.remove('dragover');
dropZone.ondrop=e=>{e.preventDefault();dropZone.classList.remove('dragover');handleCSV(e.dataTransfer.files[0]);};
csvInput.onchange=e=>{if(e.target.files[0])handleCSV(e.target.files[0]);};
function handleCSV(file){const reader=new FileReader();reader.onload=e=>{const lines=e.target.result.trim().split('\n').map(l=>l.trim()).filter(l=>l);const hasHeader=isNaN(parseInt(lines[0].split(',')[0]));const dataLines=hasHeader?lines.slice(1):lines;const map={};for(const line of dataLines){const[j,o,m,d]=line.split(',').map(s=>parseInt(s.trim()));if(isNaN(j)||isNaN(m)||isNaN(d))continue;if(!map[j])map[j]=[];map[j].push({machine:m,duration:d});}jobsContainer.innerHTML='';jobCounter=0;jobsData=[];activeMachineNames={};Object.keys(map).sort((a,b)=>a-b).forEach(jid=>{const ops=map[jid];addJob(ops.map(o=>o.machine),ops.map(o=>o.duration));});$('tabManual').click();};reader.readAsText(file);}
$('downloadSampleBtn').onclick=()=>{let csv='Job,Operation,Machine,Duration\n';PRESETS.ft06.jobs.forEach(j=>j.operations.forEach((o,i)=>{csv+=`${j.id},${i+1},${o.machine},${o.duration}\n`;}));downloadFile('sample_jssp.csv',csv);};
function downloadFile(name,content){const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(content);a.download=name;a.click();}

// PREVIEW
function updatePreview(){if(jobsData.length===0){dataPreview.style.display='none';runBtn.disabled=true;return;}dataPreview.style.display='block';runBtn.disabled=false;const totalOps=jobsData.reduce((s,j)=>s+j.operations.length,0);const machines=new Set();jobsData.forEach(j=>j.operations.forEach(o=>machines.add(o.machine)));previewStats.innerHTML=`<span>${jobsData.length} Jobs</span><span>${totalOps} Operations</span><span>${machines.size} Machines</span>`;previewTable.innerHTML='';jobsData.forEach(j=>j.operations.forEach((o,i)=>{const mn=activeMachineNames[o.machine]||('M'+o.machine);previewTable.innerHTML+=`<tr><td>${j.id}</td><td>${i+1}</td><td>${mn}</td><td>${o.duration}</td></tr>`;}));}

function getMachineName(m){return activeMachineNames[m]||('M'+m);}

// =================== PSO ENGINE ===================
function decodeSchedule(chromosome,jobs){const nJobs=jobs.length,opCounter=new Array(nJobs).fill(0),machineTime={},jobTime=new Array(nJobs).fill(0),schedule=[];
for(const gene of chromosome){const ji=gene,oi=opCounter[ji],op=jobs[ji].operations[oi],m=op.machine;if(!(m in machineTime))machineTime[m]=0;const start=Math.max(machineTime[m],jobTime[ji]),end=start+op.duration;schedule.push({job:jobs[ji].id,jobIdx:ji,op:oi+1,machine:m,start,end,duration:op.duration});machineTime[m]=end;jobTime[ji]=end;opCounter[ji]++;}
return{schedule,makespan:Math.max(...Object.values(machineTime))};}

function rovDecode(position,jobs){
// Build gene list: each job index repeated by its operation count
const genes=[];jobs.forEach((j,ji)=>{for(let i=0;i<j.operations.length;i++)genes.push(ji);});
const D=genes.length;
// Create index-value pairs from position, sort by value (Ranked Order Value)
const indexed=position.map((v,i)=>({v,i}));indexed.sort((a,b)=>a.v-b.v);
// Map sorted indices to gene sequence
const chromosome=new Array(D);for(let k=0;k<D;k++)chromosome[k]=genes[indexed[k].i];
return chromosome;}

function runPSO(jobs,params,onProgress){
const{swarmSize,iterations,inertiaW,cognitiveC,socialC}=params;
const D=jobs.reduce((s,j)=>s+j.operations.length,0);
const Vmax=2,Xmax=5;
// Initialize swarm
const particles=[];
for(let i=0;i<swarmSize;i++){
const pos=Array.from({length:D},()=>(Math.random()*2-1)*Xmax);
const vel=Array.from({length:D},()=>(Math.random()*2-1)*Vmax);
const chrom=rovDecode(pos,jobs);
const fit=decodeSchedule(chrom,jobs).makespan;
particles.push({pos,vel,pBestPos:pos.slice(),pBestFit:fit});}
// Global best
let gBestPos=null,gBestFit=Infinity;
particles.forEach(p=>{if(p.pBestFit<gBestFit){gBestFit=p.pBestFit;gBestPos=p.pBestPos.slice();}});
const history=[];let bestIter=0;
for(let t=0;t<iterations;t++){
// Linearly decrease inertia from inertiaW to 0.4
const w=inertiaW-(inertiaW-0.4)*(t/iterations);
for(const p of particles){
for(let d=0;d<D;d++){
const r1=Math.random(),r2=Math.random();
p.vel[d]=w*p.vel[d]+cognitiveC*r1*(p.pBestPos[d]-p.pos[d])+socialC*r2*(gBestPos[d]-p.pos[d]);
if(p.vel[d]>Vmax)p.vel[d]=Vmax;if(p.vel[d]<-Vmax)p.vel[d]=-Vmax;
p.pos[d]+=p.vel[d];
if(p.pos[d]>Xmax)p.pos[d]=Xmax;if(p.pos[d]<-Xmax)p.pos[d]=-Xmax;}
const chrom=rovDecode(p.pos,jobs);
const fit=decodeSchedule(chrom,jobs).makespan;
if(fit<p.pBestFit){p.pBestFit=fit;p.pBestPos=p.pos.slice();}
if(fit<gBestFit){gBestFit=fit;gBestPos=p.pos.slice();bestIter=t;}}
history.push(gBestFit);
if(onProgress)onProgress(t,iterations);}
const bestChrom=rovDecode(gBestPos,jobs);
const bestSchedule=decodeSchedule(bestChrom,jobs);
return{bestMakespan:gBestFit,bestGen:bestIter,history,schedule:bestSchedule.schedule,chromosome:bestChrom};}

// =================== RUN & VISUALIZE ===================
runBtn.onclick=()=>{
if(jobsData.length===0)return;
const params={swarmSize:parseInt($('swarmSize').value)||80,iterations:parseInt($('iterations').value)||300,inertiaW:parseFloat($('inertiaW').value)||0.729,cognitiveC:parseFloat($('cognitiveC').value)||1.494,socialC:parseFloat($('socialC').value)||1.494};
const jobs=jobsData.map(j=>({id:j.id,operations:j.operations.slice()}));
runBtn.disabled=true;$('runBtnText').textContent='⏳ Swarming...';$('progressWrap').style.display='flex';$('navStatus').textContent='Running PSO...';$('navStatus').className='nav-status running';
setTimeout(()=>{
const t0=performance.now();
const result=runPSO(jobs,params,(iter,total)=>{const pct=Math.round((iter/total)*100);$('progressFill').style.width=pct+'%';$('progressLabel').textContent=pct+'%';});
const elapsed=((performance.now()-t0)/1000).toFixed(2);
$('progressFill').style.width='100%';$('progressLabel').textContent='100%';
showResults(result,elapsed,jobs);
runBtn.disabled=false;$('runBtnText').textContent='🐝 Run Particle Swarm Optimization';$('navStatus').textContent='Done — Makespan: '+result.bestMakespan;$('navStatus').className='nav-status done';
setTimeout(()=>{$('progressWrap').style.display='none';},1500);
},50);};

function showResults(result,elapsed,jobs){
$('emptyState').style.display='none';$('resultsArea').style.display='block';
const totalOps=jobs.reduce((s,j)=>s+j.operations.length,0);
$('metricMakespan').textContent=result.bestMakespan;$('metricBestGen').textContent=result.bestGen;$('metricTime').textContent=elapsed+'s';$('metricOps').textContent=totalOps;
renderGantt(result.schedule,result.bestMakespan,jobs);renderConvergence(result.history);renderScheduleTable(result.schedule);
$('downloadScheduleBtn').onclick=()=>downloadSchedule(result.schedule);$('resultsArea').scrollIntoView({behavior:'smooth'});}

// GANTT
function renderGantt(schedule,makespan,jobs){
const container=$('ganttContainer'),legend=$('ganttLegend'),ruler=$('ganttRuler');container.innerHTML='';legend.innerHTML='';ruler.innerHTML='';
const machines=[...new Set(schedule.map(s=>s.machine))].sort((a,b)=>a-b);
const jobIds=[...new Set(schedule.map(s=>s.job))].sort((a,b)=>a-b);
jobIds.forEach((jid,i)=>{const color=JOB_COLORS[i%JOB_COLORS.length];legend.innerHTML+=`<span class="gl-item"><span class="gl-color" style="background:${color}"></span>Job ${jid}</span>`;});
machines.forEach(m=>{
const row=document.createElement('div');row.className='gantt-row';
const label=document.createElement('div');label.className='gantt-label';label.textContent=getMachineName(m);
const track=document.createElement('div');track.className='gantt-track';track.style.minWidth=Math.max(600,makespan*40)+'px';
schedule.filter(s=>s.machine===m).sort((a,b)=>a.start-b.start).forEach((op,idx)=>{
const left=(op.start/makespan)*100,width=(op.duration/makespan)*100,ci=jobIds.indexOf(op.job),color=JOB_COLORS[ci%JOB_COLORS.length];
const bar=document.createElement('div');bar.className='gantt-bar';bar.style.left=left+'%';bar.style.width=width+'%';bar.style.background=color;bar.style.animationDelay=(idx*0.08)+'s';
bar.innerHTML=`J${op.job}·O${op.op}<span class="bar-tip">Job ${op.job} Op ${op.op}<br>${getMachineName(op.machine)} | ${op.start}→${op.end} (${op.duration})</span>`;
track.appendChild(bar);});
row.appendChild(label);row.appendChild(track);container.appendChild(row);});
const step=makespan<=20?1:makespan<=100?5:Math.ceil(makespan/20);
ruler.style.paddingLeft='110px';
const rulerTrack=document.createElement('div');rulerTrack.style.cssText='display:flex;justify-content:space-between;min-width:'+Math.max(600,makespan*40)+'px';
for(let t=0;t<=makespan;t+=step){const s=document.createElement('span');s.textContent=t;rulerTrack.appendChild(s);}ruler.appendChild(rulerTrack);}

// CONVERGENCE
function renderConvergence(history){
const canvas=$('convergenceCanvas'),ctx=canvas.getContext('2d');canvas.width=canvas.offsetWidth*2;canvas.height=560;ctx.scale(2,2);
const W=canvas.offsetWidth,H=280;ctx.clearRect(0,0,W,H);
const pad={t:25,r:20,b:35,l:50},cw=W-pad.l-pad.r,ch=H-pad.t-pad.b;
const maxF=Math.max(...history),minF=Math.min(...history),range=maxF-minF||1;
ctx.strokeStyle='rgba(255,255,255,.06)';ctx.lineWidth=0.5;
for(let i=0;i<=5;i++){const y=pad.t+(i/5)*ch;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(pad.l+cw,y);ctx.stroke();ctx.fillStyle='#52525b';ctx.font='10px JetBrains Mono';ctx.textAlign='right';ctx.fillText((maxF-(i/5)*range).toFixed(0),pad.l-6,y+4);}
ctx.beginPath();ctx.strokeStyle='#06b6d4';ctx.lineWidth=2;
history.forEach((v,i)=>{const x=pad.l+(i/(history.length-1))*cw,y=pad.t+(1-(v-minF)/range)*ch;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});ctx.stroke();
ctx.globalAlpha=0.08;ctx.lineWidth=8;ctx.stroke();ctx.globalAlpha=1;
const lastX=pad.l+cw;ctx.lineTo(lastX,pad.t+ch);ctx.lineTo(pad.l,pad.t+ch);ctx.closePath();ctx.fillStyle='rgba(6,182,212,.06)';ctx.fill();
ctx.fillStyle='#52525b';ctx.font='10px Inter';ctx.textAlign='center';ctx.fillText('Iteration',W/2,H-5);
ctx.save();ctx.translate(12,H/2);ctx.rotate(-Math.PI/2);ctx.fillText('Makespan',0,0);ctx.restore();
const bestVal=Math.min(...history),bestIdx=history.lastIndexOf(bestVal);
const bx=pad.l+(bestIdx/(history.length-1))*cw,by=pad.t+(1-(bestVal-minF)/range)*ch;
ctx.beginPath();ctx.arc(bx,by,4,0,Math.PI*2);ctx.fillStyle='#06b6d4';ctx.fill();
ctx.fillStyle='#f4f4f5';ctx.font='bold 10px JetBrains Mono';ctx.textAlign='left';ctx.fillText('Best: '+bestVal,bx+8,by-6);}

// SCHEDULE TABLE
function renderScheduleTable(schedule){
const body=$('scheduleBody'),sorted=[...schedule].sort((a,b)=>a.machine-b.machine||a.start-b.start);
const jobIds=[...new Set(schedule.map(s=>s.job))].sort((a,b)=>a-b);
body.innerHTML=sorted.map(s=>{const ci=jobIds.indexOf(s.job),color=JOB_COLORS[ci%JOB_COLORS.length];return`<tr><td>${getMachineName(s.machine)}</td><td><span class="td-color" style="background:${color}"></span>Job ${s.job}</td><td>Op ${s.op}</td><td>${s.start}</td><td>${s.end}</td><td>${s.duration}</td></tr>`;}).join('');}

function downloadSchedule(schedule){let csv='Machine,Job,Operation,Start,End,Duration\n';[...schedule].sort((a,b)=>a.machine-b.machine||a.start-b.start).forEach(s=>{csv+=`${getMachineName(s.machine)},Job ${s.job},Op ${s.op},${s.start},${s.end},${s.duration}\n`;});downloadFile('optimized_schedule.csv',csv);}
