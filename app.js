const DEFAULT_PROJECTS = [
 {id:"weather",title:"Raspberry Pi Weather Station with Predictive Analysis",description:"Developed an IoT weather monitoring system using Raspberry Pi, cloud integration and machine learning for climate prediction.",tech:["Raspberry Pi","IoT","Machine Learning"],github:"",demo:""},
 {id:"crowd",title:"Intelligent Crowd Risk Prediction System",description:"Built a YOLOv8-based crowd monitoring system for density analysis, risk prediction and automated alerts.",tech:["Python","YOLOv8","Computer Vision"],github:"",demo:""}
];
const $ = s => document.querySelector(s);
const escapeHTML = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const getProjects = () => { try { const x=JSON.parse(localStorage.getItem("aswanthPortfolioProjects")); return Array.isArray(x)?x:DEFAULT_PROJECTS; } catch { return DEFAULT_PROJECTS; } };
const saveProjects = p => localStorage.setItem("aswanthPortfolioProjects",JSON.stringify(p));
function renderProjects(){
 const projects=getProjects();
 $("#projectGrid").innerHTML=projects.map((p,i)=>`<article class="project-card panel"><div class="project-top"><span class="project-icon">⌘</span><div class="project-links">${p.github?`<a href="${escapeHTML(p.github)}" target="_blank" rel="noopener">GitHub ↗</a>`:""}${p.demo?`<a href="${escapeHTML(p.demo)}" target="_blank" rel="noopener">Live demo ↗</a>`:""}</div></div><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.description)}</p><div class="project-tech">${(p.tech||[]).map(t=>`<span>${escapeHTML(t)}</span>`).join("")}</div></article>`).join("") || `<div class="panel project-card"><p>No projects yet. Open Manage projects to add one.</p></div>`;
 if(!$("#dashboard").hidden) renderAdminList();
}
function renderAdminList(){
 $("#adminProjectList").innerHTML=getProjects().map(p=>`<div class="admin-row"><strong>${escapeHTML(p.title)}</strong><div class="admin-actions"><button data-edit="${escapeHTML(p.id)}">Edit</button><button class="delete" data-delete="${escapeHTML(p.id)}">Delete</button></div></div>`).join("") || '<p class="muted">No projects added yet.</p>';
}
const modal=$("#adminModal");
$("#adminOpen").addEventListener("click",()=>{modal.hidden=false;$("#adminPassword").focus()});
$("#closeAdmin").addEventListener("click",()=>modal.hidden=true);
modal.addEventListener("click",e=>{if(e.target===modal)modal.hidden=true});
$("#loginForm").addEventListener("submit",e=>{e.preventDefault();if($("#adminPassword").value==="admin123"){ $("#adminLogin").hidden=true;$("#dashboard").hidden=false;$("#loginError").textContent="";renderAdminList();}else $("#loginError").textContent="Incorrect demo password.";});
$("#logout").addEventListener("click",()=>{ $("#dashboard").hidden=true;$("#adminLogin").hidden=false;$("#adminPassword").value="";clearEditor();});
function clearEditor(){ $("#projectForm").reset();$("#editId").value="";$("#saveProject").textContent="Save project"; }
$("#cancelEdit").addEventListener("click",clearEditor);
$("#projectForm").addEventListener("submit",e=>{
 e.preventDefault();
 const project={id:$("#editId").value||("p-"+Date.now()),title:$("#projectTitle").value.trim(),description:$("#projectDescription").value.trim(),tech:$("#projectTech").value.split(",").map(x=>x.trim()).filter(Boolean),github:$("#projectGithub").value.trim(),demo:$("#projectDemo").value.trim()};
 const projects=getProjects(), idx=projects.findIndex(p=>p.id===project.id);
 if(idx>=0)projects[idx]=project;else projects.push(project);
 saveProjects(projects);clearEditor();renderProjects();
});
$("#adminProjectList").addEventListener("click",e=>{
 const edit=e.target.closest("[data-edit]"), del=e.target.closest("[data-delete]");
 if(edit){const p=getProjects().find(x=>x.id===edit.dataset.edit);if(!p)return;$("#editId").value=p.id;$("#projectTitle").value=p.title;$("#projectDescription").value=p.description;$("#projectTech").value=(p.tech||[]).join(", ");$("#projectGithub").value=p.github||"";$("#projectDemo").value=p.demo||"";$("#saveProject").textContent="Update project";$("#projectTitle").focus();}
 if(del){if(confirm("Delete this project?")){saveProjects(getProjects().filter(p=>p.id!==del.dataset.delete));renderProjects();clearEditor();}}
});
$("#exportProjects").addEventListener("click",()=>{const blob=new Blob([JSON.stringify(getProjects(),null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="portfolio-projects.json";a.click();URL.revokeObjectURL(url);});
$("#contactForm").addEventListener("submit",e=>{e.preventDefault();const f=new FormData(e.currentTarget);const subject=encodeURIComponent(f.get("subject"));const body=encodeURIComponent(`Name: ${f.get("name")}\nEmail: ${f.get("email")}\n\n${f.get("message")}`);$("#contactStatus").textContent="Opening your email application. Send the prepared message to complete delivery.";location.href=`mailto:aswanthkj10@gmail.com?subject=${subject}&body=${body}`;});
async function loadGithub(){
 const user=$("#githubUser").value.trim();if(!user){$("#githubStatus").textContent="Enter a GitHub username.";return;}
 $("#githubStatus").textContent="Loading repositories…";$("#githubGrid").innerHTML="";$("#githubProfile").href=`https://github.com/${encodeURIComponent(user)}`;
 try{
  const response=await fetch(`https://api.github.com/users/${encodeURIComponent(user)}/repos?sort=updated&per_page=6&type=owner`,{headers:{"Accept":"application/vnd.github+json"}});
  if(!response.ok)throw new Error(response.status===404?"Username not found.":"GitHub API request failed (possibly rate-limited).");
  const repos=await response.json();
  $("#githubGrid").innerHTML=repos.map(r=>`<article class="repo-card panel"><div class="project-top"><span class="project-icon">⌘</span><a class="text-link" href="${escapeHTML(r.html_url)}" target="_blank" rel="noopener">Open ↗</a></div><h3>${escapeHTML(r.name)}</h3><p>${escapeHTML(r.description||"No description provided.")}</p><div class="repo-meta"><span class="repo-language">${escapeHTML(r.language||"Code")}</span><span>★ ${r.stargazers_count}</span><span>⑂ ${r.forks_count}</span></div></article>`).join("")||'<p class="status">No public repositories found.</p>';
  $("#githubStatus").textContent=`Showing ${repos.length} recently updated public repositories for ${user}.`;
 }catch(err){$("#githubStatus").textContent=err.message+" Check your internet connection and try again.";}
}
$("#loadGithub").addEventListener("click",loadGithub);$("#githubUser").addEventListener("keydown",e=>{if(e.key==="Enter")loadGithub()});
$("#themeToggle").addEventListener("click",()=>{document.body.classList.toggle("theme-light");localStorage.setItem("aswanthPortfolioLight",document.body.classList.contains("theme-light")?"1":"0")});
if(localStorage.getItem("aswanthPortfolioLight")==="1")document.body.classList.add("theme-light");
$("#menuToggle").addEventListener("click",()=>$("#nav").classList.toggle("open"));
$("#nav").addEventListener("click",e=>{if(e.target.tagName==="A")$("#nav").classList.remove("open")});
renderProjects();
