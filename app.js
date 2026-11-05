'use strict';
const $=id=>document.getElementById(id);
const controls=['search','year','category','reset','download'];
$('print').addEventListener('click',()=>window.print());
function setDisabled(value){for(const id of controls)$(id).disabled=value;}
async function loadData(){
 setDisabled(true);
 $('count').textContent='กำลังโหลดข้อมูล…';
 $('results').replaceChildren();
 try{
  const response=await fetch(new URL('./anutin_public_record.json',document.baseURI),{cache:'no-cache',signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error('HTTP '+response.status);
  const data=await response.json();
  if(!Array.isArray(data.events)||!Array.isArray(data.sources)||!Array.isArray(data.limitations_th))throw new Error('Invalid dataset');
  const sourceIds=new Set(data.sources.map(s=>s.id));
  if(data.events.some(e=>typeof e.title_th!=='string'||typeof e.summary_and_response_th!=='string'||!Array.isArray(e.source_ids)||e.source_ids.some(id=>!sourceIds.has(id))))throw new Error('Invalid event or source');
  initialize(data);
  setDisabled(false);
 }catch(error){
  $('count').textContent='โหลดข้อมูลไม่สำเร็จ';
  const message=document.createElement('p');message.className='empty';message.textContent='ไม่สามารถโหลดข้อมูลได้ กรุณาลองอีกครั้ง';
  const retry=document.createElement('button');retry.type='button';retry.textContent='ลองโหลดใหม่';retry.addEventListener('click',loadData);
  $('results').append(message,retry);
 }
}
function initialize(data){
'use strict';

const labels={legal_outcome:'ผลคดี',political_controversy:'ข้อถกเถียงทางการเมือง',policy_criticism:'ข้อวิจารณ์นโยบาย',public_statement:'คำพูดสาธารณะ',reported_social_media_statement:'ข้อความโซเชียลตามรายงาน',communication_criticism:'ข้อวิจารณ์การสื่อสาร',response:'คำชี้แจง',conduct_criticism:'ข้อวิจารณ์พฤติกรรม',policy_allegation:'ข้อกล่าวหาด้านนโยบาย',transparency_criticism:'ความโปร่งใส',policy_controversy:'ข้อถกเถียงนโยบาย',administration_criticism:'ข้อวิจารณ์การบริหาร',legal_complaint:'ข้อร้องเรียนทางกฎหมาย',political_position:'จุดยืนการเมือง',asset_question:'ข้อสงสัยทรัพย์สิน',policy_disagreement:'ความเห็นต่างด้านนโยบาย',administration_controversy:'ข้อถกเถียงการบริหาร',disputed_reporting:'ข่าวและคำชี้แจงโต้แย้ง',land_question:'ข้อสงสัยที่ดิน',investigative_reporting:'รายงานสืบสวน',political_allegation:'ข้อกล่าวหาทางการเมือง',conflict_of_interest_question:'ข้อสงสัยผลประโยชน์ทับซ้อน',image_controversy:'ดราม่าภาพลักษณ์',press_freedom_complaint:'ข้อร้องเรียนเสรีภาพสื่อ',agency_outcome:'ผลพิจารณาของหน่วยงาน',defamation_lawsuit:'คดีหมิ่นประมาท',press_relations_controversy:'ข้อถกเถียงความสัมพันธ์กับสื่อ'};
const states={page_opened_in_conversation:'เปิดหน้าแล้ว',search_result_only:'พบจากผลค้นหา',open_failed_after_search:'พบจากผลค้นหา · เปิดหน้าไม่สำเร็จ'};
const bySource=new Map(data.sources.map(s=>[s.id,s]));

function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n}
$('totalEvents').textContent=data.events.length;$('totalSources').textContent=data.sources.length;$('compiled').textContent=data.compiled_on;
for(const y of [...new Set(data.events.map(e=>e.year_be))].sort((a,b)=>a-b)){const o=el('option',String(y));o.value=y;$('year').append(o)}
for(const c of [...new Set(data.events.map(e=>e.category))].sort((a,b)=>(labels[a]||a).localeCompare(labels[b]||b,'th'))){const o=el('option',labels[c]||c);o.value=c;$('category').append(o)}
for(const t of data.limitations_th)$('limitations').append(el('li',t));
function render(){const q=$('search').value.trim().toLocaleLowerCase('th');const rows=data.events.filter(e=>(!$('year').value||String(e.year_be)===$('year').value)&&(!$('category').value||e.category===$('category').value)&&(!q||[e.title_th,e.summary_and_response_th,labels[e.category],e.year_be,e.id].join(' ').toLocaleLowerCase('th').includes(q)));$('count').textContent=`แสดง ${rows.length} จาก ${data.events.length} รายการ`;$('results').replaceChildren();let current,grid;for(const e of rows){if(current!==e.year_be){current=e.year_be;$('results').append(el('h2',`พ.ศ. ${current}`,'year'));grid=el('div',undefined,'cards');$('results').append(grid)}const card=el('article',undefined,'card');const meta=el('div',undefined,'meta');meta.append(el('span',labels[e.category]||e.category,'badge'),el('span',e.id));card.append(meta,el('h3',e.title_th),el('p',e.summary_and_response_th));if(e.suppression_status==='alleged_silencing_disputed_not_judicially_determined')card.append(el('p','ข้อกล่าวหาว่าปิดปาก: มีการโต้แย้ง ยังไม่ใช่คำวินิจฉัยศาล','legal'));if(e.suppression_status==='reported_complaint_about_officials_not_direct_order_by_subject')card.append(el('p','ร้องเรียนเจ้าหน้าที่ในหน่วยงาน ไม่พบหลักฐานคำสั่งโดยตรงจากอนุทิน','legal'));const sources=el('div',undefined,'sources');sources.append(el('strong','แหล่งข้อมูล'));const list=el('ul');for(const id of e.source_ids){const s=bySource.get(id);if(!s)continue;let url;try{url=new URL(s.url);if(!['https:','http:'].includes(url.protocol))continue}catch{continue}const li=el('li');const a=el('a',url.hostname.replace(/^www\./,''));a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';li.append(a,el('div',states[s.fetch_status]||'ยังไม่ได้ตรวจสถานะ','source-state'));list.append(li)}sources.append(list);card.append(sources,el('p','ยังไม่ได้ตรวจยืนยันสถานะทางกฎหมายล่าสุด','legal'));grid.append(card)}if(!rows.length)$('results').append(el('p','ไม่พบรายการที่ตรงกับตัวกรอง ลองเปลี่ยนคำค้นหรือเลือกทุกปี','empty'))}
for(const id of ['search','year','category'])$(id).addEventListener(id==='search'?'input':'change',render);
$('reset').addEventListener('click',()=>{$('search').value='';$('year').value='';$('category').value='';render();$('search').focus()});
$('download').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json;charset=utf-8'}));const a=el('a');a.href=url;a.download='anutin_public_record.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)});
render();
}
loadData();
