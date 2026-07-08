"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { Exercicio, Questao } from "@/types";
import { useAuth } from "../AuthContext";

const CSS = `
@keyframes exPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
@keyframes exFadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes exSlide{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
@keyframes exGlow{0%,100%{box-shadow:0 0 18px rgba(37,99,235,.35)}50%{box-shadow:0 0 32px rgba(6,182,212,.45),0 0 60px rgba(37,99,235,.18)}}
@keyframes exCorrect{0%{transform:scale(1)}40%{transform:scale(1.025)}100%{transform:scale(1)}}
@keyframes exWrong{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
@keyframes exSpin{to{transform:rotate(360deg)}}
@keyframes exPop{0%{transform:scale(.85);opacity:0}60%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
@keyframes exShine{0%{left:-100%}100%{left:200%}}
.ex-hdr-btn{background:none;border:1px solid #e2e8f0;border-radius:10px;padding:8px 16px;cursor:pointer;font-family:inherit;font-size:.82rem;font-weight:600;display:flex;align-items:center;gap:6px;transition:all .2s;color:#64748b}
.ex-hdr-btn:hover{border-color:#2563eb;color:#2563eb;background:rgba(37,99,235,.04);transform:translateY(-1px)}
.ex-hdr-btn.danger{border-color:#fecaca;color:#ef4444}
.ex-hdr-btn.danger:hover{background:rgba(239,68,68,.06);border-color:#ef4444}
.ex-step{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:800;cursor:pointer;transition:all .2s;border:2px solid #e2e8f0;background:#fff;color:#94a3b8}
.ex-step.active{border-color:#2563eb;background:#2563eb;color:#fff;transform:scale(1.15);box-shadow:0 0 0 4px rgba(37,99,235,.15)}
.ex-step.correct{border-color:#10b981;background:#10b981;color:#fff}
.ex-step.wrong{border-color:#ef4444;background:#ef4444;color:#fff}
.ex-step:hover{transform:scale(1.1)}
`;

const C = {
  bg:"#f5f7fb",surface:"#ffffff",text:"#1e293b",text2:"#64748b",text3:"#94a3b8",
  border:"#e2e8f0",accent:"#2563eb",accent2:"#06b6d4",green:"#10b981",red:"#ef4444",gold:"#f59e0b",
};

interface ModuleGroup{id:string;nome:string;categoria:string;icone:string;count:number;exercicios:any[]}
type Phase="select-module"|"select-exercise"|"quiz"|"result";
interface Props{exerciseId?:string|null;onBack:()=>void}

export default function ExerciseResolutionPage({exerciseId,onBack}:Props){
  const [phase,setPhase]=useState<Phase>(exerciseId?"quiz":"select-module");
  const [modules,setModules]=useState<ModuleGroup[]>([]);
  const [selectedModule,setSelectedModule]=useState<ModuleGroup|null>(null);
  const [exercise,setExercise]=useState<Exercicio|null>(null);
  const [loading,setLoading]=useState(true);
  const { token } = useAuth();
  const [currentIdx,setCurrentIdx]=useState(0);
  const [selectedAlt,setSelectedAlt]=useState<string|null>(null);
  const [showFeedback,setShowFeedback]=useState(false);
  const [respostas,setRespostas]=useState<{idx:number;acerto:boolean}[]>([]);
  const [timerOn,setTimerOn]=useState(false);
  const [seconds,setSeconds]=useState(0);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);

  // Timer
  useEffect(()=>{
    if(timerOn&&phase==="quiz"){
      timerRef.current=setInterval(()=>setSeconds(s=>s+1),1000);
      return()=>{if(timerRef.current)clearInterval(timerRef.current)};
    } else {
      if(timerRef.current){clearInterval(timerRef.current);timerRef.current=null;}
    }
  },[timerOn,phase]);
  const fmtTime=(s:number)=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  useEffect(()=>{
    fetch("/api/exercicios").then(r=>r.json()).then(data=>{
      if(!Array.isArray(data))return;
      const map=new Map<string,ModuleGroup>();
      data.forEach((ex:any)=>{
        const mid=ex.conteudo_id?._id||"other";
        if(!map.has(mid))map.set(mid,{id:mid,nome:ex.conteudo_id?.nome||"Geral",categoria:ex.conteudo_id?.categoria||"",icone:ex.conteudo_id?.icone||"📘",count:0,exercicios:[]});
        const g=map.get(mid)!;g.count++;g.exercicios.push(ex);
      });
      setModules(Array.from(map.values()));
    }).catch(console.error);
  },[]);

  const loadExercise=useCallback(async(id:string)=>{
    setLoading(true);
    try{const res=await fetch(`/api/exercicios/${id}`);const data=await res.json();setExercise(data);setCurrentIdx(0);setSelectedAlt(null);setShowFeedback(false);setRespostas([]);setSeconds(0);setPhase("quiz");}
    catch(e){console.error(e);}
    finally{setLoading(false);}
  },[]);

  useEffect(()=>{if(exerciseId)loadExercise(exerciseId);else setLoading(false);},[exerciseId,loadExercise]);

  useEffect(() => {
    if (phase === "result" && exercise) {
      try {
        const total = exercise.questoes?.length || 0;
        const pts = respostas.filter(r => r.acerto).length;
        const perc = total ? Math.round((pts / total) * 100) : 0;
        
        const map = JSON.parse(localStorage.getItem('odisley_exercise_progress') || '{}');
        map[exercise._id] = {
          questoesRespondidas: total,
          totalQuestoes: total,
          status: "Concluído"
        };
        localStorage.setItem('odisley_exercise_progress', JSON.stringify(map));
        
        // Registrar atividade ao concluir exercício
        if (token) {
          fetch('/api/user/activity', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(console.error);
        }
      } catch(e) {}
    }
  }, [phase, exercise, respostas, token]);

  const questoes=exercise?.questoes||[];
  const qAtiva=questoes[currentIdx] as Questao|undefined;
  const progress=questoes.length?((currentIdx+(showFeedback?1:0))/questoes.length)*100:0;
  const acertos=respostas.filter(r=>r.acerto).length;
  const diffColor=exercise?.dificuldade==="Fácil"?C.green:exercise?.dificuldade==="Médio"?C.gold:C.red;

  const handleVerify=()=>{if(!selectedAlt||!qAtiva)return;setRespostas(p=>[...p,{idx:currentIdx,acerto:selectedAlt===qAtiva.respostaCorreta}]);setShowFeedback(true);};
  const goNext=()=>{if(currentIdx<questoes.length-1){setCurrentIdx(i=>i+1);setSelectedAlt(null);setShowFeedback(false);}else setPhase("result");};
  const goPrev=()=>{if(currentIdx>0){setCurrentIdx(i=>i-1);setSelectedAlt(null);setShowFeedback(false);}};
  const goToQ=(i:number)=>{setCurrentIdx(i);setSelectedAlt(null);setShowFeedback(false);};

  const getStepClass=(i:number)=>{const r=respostas.find(x=>x.idx===i);if(i===currentIdx)return"ex-step active";if(r)return r.acerto?"ex-step correct":"ex-step wrong";return"ex-step";};

  const moduleName=selectedModule?.nome||(exercise as any)?.conteudo_id?.nome||"";

  return(
    <div style={{position:"fixed",inset:0,zIndex:10000,background:C.bg,overflowY:"auto",color:C.text,fontFamily:"'DM Sans','Inter',sans-serif"}}>
      <style>{CSS}</style>

      {/* ══ TOP BAR ══ */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 1.5rem",display:"flex",alignItems:"center",justifyContent:"space-between",height:56}}>
        <button className="ex-hdr-btn" onClick={phase==="select-exercise"?()=>setPhase("select-module"):phase==="quiz"||phase==="result"?()=>{setPhase("select-module");setExercise(null);setTimerOn(false);}:onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          {phase==="select-module"?"Voltar":"Trocar exercício"}
        </button>
        <div style={{textAlign:"center"}}>
          <span style={{fontWeight:800,fontSize:".95rem",fontFamily:"'Syne',sans-serif"}}>Exercícios</span>
          {moduleName&&phase==="quiz"&&<div style={{fontSize:".7rem",color:C.text3,fontWeight:600}}>{moduleName}</div>}
        </div>
        <button className="ex-hdr-btn danger" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          Sair
        </button>
      </div>

      {loading&&<div style={{display:"flex",justifyContent:"center",paddingTop:"20vh"}}><div style={{width:36,height:36,border:`3px solid ${C.border}`,borderTopColor:C.accent,borderRadius:"50%",animation:"exSpin .7s linear infinite"}}/></div>}

      {/* ══ SELECT MODULE ══ */}
      {!loading&&phase==="select-module"&&(
        <div style={{maxWidth:900,margin:"0 auto",padding:"3rem 2rem",animation:"exFadeIn .4s ease"}}>
          <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
            <div style={{fontSize:".72rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".12em",color:C.accent,marginBottom:6}}>Escolha um módulo</div>
            <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"1.8rem",fontWeight:800}}>Praticar Exercícios</h2>
            <p style={{color:C.text2,marginTop:6}}>Selecione o módulo para ver os exercícios disponíveis</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"1.25rem"}}>
            {modules.map(m=><ModuleCard key={m.id} m={m} onClick={()=>{setSelectedModule(m);setPhase("select-exercise");}}/>)}
          </div>
          {modules.length===0&&<p style={{textAlign:"center",color:C.text3,marginTop:"3rem"}}>Nenhum exercício cadastrado ainda.</p>}
        </div>
      )}

      {/* ══ SELECT EXERCISE ══ */}
      {!loading&&phase==="select-exercise"&&selectedModule&&(
        <div style={{maxWidth:700,margin:"0 auto",padding:"3rem 2rem",animation:"exFadeIn .4s ease"}}>
          <div style={{textAlign:"center",marginBottom:"2rem"}}>
            <span style={{fontSize:"2rem"}}>{selectedModule.icone}</span>
            <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"1.5rem",fontWeight:800,marginTop:6}}>{selectedModule.nome}</h2>
            <p style={{color:C.text2,fontSize:".88rem"}}>{selectedModule.count} exercício(s) disponível(is)</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:".75rem"}}>
            {selectedModule.exercicios.map((ex:any)=>(
              <button key={ex._id} onClick={()=>loadExercise(ex._id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1.1rem 1.4rem",background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,cursor:"pointer",transition:"all .2s",textAlign:"left",fontFamily:"inherit",color:C.text}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,.06)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
                <div>
                  <div style={{fontWeight:700,fontSize:".95rem",marginBottom:4}}>{ex.titulo}</div>
                  <div style={{display:"flex",gap:"1rem",fontSize:".78rem",color:C.text2}}>
                    <span style={{color:ex.dificuldade==="Fácil"?C.green:ex.dificuldade==="Médio"?C.gold:C.red,fontWeight:700}}>{ex.dificuldade}</span>
                    <span>📋 {ex.questoes?.length||0} questões</span>
                  </div>
                </div>
                <span style={{fontSize:"1.2rem",color:C.accent}}>→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ QUIZ ══ */}
      {!loading&&phase==="quiz"&&exercise&&qAtiva&&(
        <div style={{maxWidth:780,margin:"0 auto",padding:"1.5rem 2rem",animation:"exFadeIn .35s ease"}}>

          {/* ── Enhanced Header ── */}
          <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,padding:"1.25rem 1.5rem",marginBottom:"1.5rem",boxShadow:"0 2px 12px rgba(0,0,0,.03)"}}>
            {/* Row 1: title + badge + timer */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
              <div>
                <div style={{fontWeight:800,fontSize:"1.05rem",fontFamily:"'Syne',sans-serif"}}>{exercise.titulo}</div>
                {moduleName&&<div style={{fontSize:".75rem",color:C.text3,marginTop:2}}>📘 {moduleName}</div>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:".75rem"}}>
                <span style={{fontSize:".72rem",fontWeight:800,padding:"4px 12px",borderRadius:8,background:diffColor+"15",color:diffColor,textTransform:"uppercase",letterSpacing:".05em"}}>{exercise.dificuldade}</span>
                {/* Timer toggle */}
                <button onClick={()=>{setTimerOn(t=>{if(t)setSeconds(0);return !t;});}} style={{background:timerOn?"rgba(37,99,235,.08)":"#f8fafc",border:`1px solid ${timerOn?C.accent:C.border}`,borderRadius:10,padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:"inherit",fontSize:".78rem",fontWeight:700,color:timerOn?C.accent:C.text3,transition:"all .2s"}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  {timerOn?fmtTime(seconds):"Timer"}
                </button>
              </div>
            </div>

            {/* Row 2: Progress bar */}
            <div style={{display:"flex",alignItems:"center",gap:".75rem",marginBottom:"1rem"}}>
              <div style={{flex:1,height:10,background:"#eef2f7",borderRadius:10,overflow:"hidden",position:"relative"}}>
                <div style={{width:`${progress}%`,height:"100%",background:`linear-gradient(90deg,${C.accent},${progress>60?C.green:C.accent2})`,borderRadius:10,transition:"width .6s cubic-bezier(.4,0,.2,1)",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:0,left:"-100%",width:"50%",height:"100%",background:"linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent)",animation:"exShine 2s ease-in-out infinite"}}/>
                </div>
              </div>
              <span style={{fontSize:".78rem",fontWeight:800,color:C.accent,minWidth:40,textAlign:"right"}}>{Math.round(progress)}%</span>
            </div>

            {/* Row 3: Step indicators */}
            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
              <span style={{fontSize:".72rem",fontWeight:700,color:C.text3,marginRight:4}}>Questão {currentIdx+1}/{questoes.length}</span>
              {questoes.map((_,i)=>(
                <button key={i} className={getStepClass(i)} onClick={()=>goToQ(i)} title={`Questão ${i+1}`}>
                  {respostas.find(r=>r.idx===i)?(respostas.find(r=>r.idx===i)!.acerto?"✓":"✗"):(i+1)}
                </button>
              ))}
            </div>
          </div>

          {/* ── Question Card ── */}
          <div key={currentIdx} style={{background:C.surface,borderRadius:18,border:`1px solid ${C.border}`,padding:"2.5rem",boxShadow:"0 4px 24px rgba(0,0,0,.04)",animation:"exSlide .4s ease"}}>
            <div style={{fontSize:"1.12rem",lineHeight:1.7,fontWeight:500,marginBottom:"2rem",color:C.text}}>{qAtiva.enunciado}</div>
            <div style={{display:"flex",flexDirection:"column",gap:".65rem"}}>
              {(["A","B","C","D","E"] as const).map(letter=>{
                if(!qAtiva.alternativas[letter])return null;
                const isSel=selectedAlt===letter,isCorr=qAtiva.respostaCorreta===letter;
                let bg=C.surface,bc=C.border,anim="";
                if(showFeedback){if(isCorr){bg="rgba(16,185,129,.08)";bc=C.green;anim="exCorrect .4s ease";}else if(isSel){bg="rgba(239,68,68,.08)";bc=C.red;anim="exWrong .4s ease";}}
                else if(isSel){bg="rgba(37,99,235,.06)";bc=C.accent;}
                return(
                  <button key={letter} disabled={showFeedback} onClick={()=>setSelectedAlt(letter)}
                    style={{display:"flex",alignItems:"center",gap:"1rem",padding:"1rem 1.2rem",borderRadius:12,border:`2px solid ${bc}`,background:bg,cursor:showFeedback?"default":"pointer",textAlign:"left",transition:"all .25s",color:C.text,fontFamily:"inherit",fontSize:".94rem",animation:anim||undefined}}>
                    <div style={{minWidth:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:isSel?(showFeedback?(isCorr?C.green:C.red):C.accent):"#f1f5f9",color:isSel?"#fff":C.text2,fontWeight:800,fontSize:".78rem",transition:"all .25s"}}>{letter}</div>
                    <div style={{flex:1}}>{qAtiva.alternativas[letter]}</div>
                    {showFeedback&&isCorr&&<span style={{color:C.green,fontWeight:800,fontSize:"1.1rem"}}>✓</span>}
                    {showFeedback&&isSel&&!isCorr&&<span style={{color:C.red,fontWeight:800,fontSize:"1.1rem"}}>✗</span>}
                  </button>
                );
              })}
            </div>

            {/* Action buttons */}
            <div style={{marginTop:"2.5rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              {!showFeedback?(<><div/><button disabled={!selectedAlt} onClick={handleVerify} style={{
                background:selectedAlt?`linear-gradient(135deg,${C.accent},${C.accent2})`:"#cbd5e1",color:"#fff",border:"none",borderRadius:14,padding:"14px 36px",fontWeight:700,fontSize:".95rem",cursor:selectedAlt?"pointer":"default",
                fontFamily:"inherit",display:"flex",alignItems:"center",gap:8,transition:"all .3s",position:"relative",overflow:"hidden",
                animation:selectedAlt?"exGlow 2s ease-in-out infinite, exPulse 2.5s ease-in-out infinite":"none",boxShadow:selectedAlt?"0 8px 24px rgba(37,99,235,.3)":"none"
              }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>Verificar Resposta</button></>):(
                <><button onClick={goPrev} disabled={currentIdx===0} className="ex-hdr-btn" style={{opacity:currentIdx===0?.4:1,cursor:currentIdx===0?"default":"pointer"}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>Anterior
                </button>
                <button onClick={goNext} style={{background:`linear-gradient(135deg,${C.accent},${C.accent2})`,color:"#fff",border:"none",borderRadius:14,padding:"14px 36px",fontWeight:700,fontSize:".95rem",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:8,boxShadow:"0 8px 24px rgba(37,99,235,.25)"}}>
                  {currentIdx===questoes.length-1?"Ver Resultado":"Próxima Questão"}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                </button></>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ RESULT ══ */}
      {phase==="result"&&exercise&&(()=>{
        const total=questoes.length,perc=total?Math.round((acertos/total)*100):0;
        return(
          <div style={{maxWidth:560,margin:"0 auto",padding:"4rem 2rem",animation:"exPop .5s ease"}}>
            <div style={{background:C.surface,borderRadius:22,padding:"3rem",textAlign:"center",border:`1px solid ${C.border}`,boxShadow:"0 12px 40px rgba(0,0,0,.06)"}}>
              <div style={{fontSize:"4rem",marginBottom:"1rem"}}>{perc>=70?"🎉":perc>=40?"💪":"📚"}</div>
              <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"1.8rem",fontWeight:800,marginBottom:".4rem"}}>{perc>=70?"Excelente trabalho!":perc>=40?"Bom esforço!":"Continue praticando!"}</h2>
              <p style={{color:C.text2,marginBottom:"2rem"}}>Você completou <strong>{exercise.titulo}</strong></p>
              {timerOn&&<p style={{color:C.accent,fontWeight:700,marginBottom:"1.5rem",fontSize:".9rem"}}>⏱ Tempo: {fmtTime(seconds)}</p>}
              <div style={{display:"flex",justifyContent:"center",gap:"2.5rem",marginBottom:"2.5rem"}}>
                <div><div style={{fontSize:"2rem",fontWeight:800,color:C.accent}}>{acertos}/{total}</div><div style={{fontSize:".72rem",color:C.text3,fontWeight:700,textTransform:"uppercase"}}>Acertos</div></div>
                <div style={{width:1,background:C.border}}/>
                <div><div style={{fontSize:"2rem",fontWeight:800,color:perc>=70?C.green:C.gold}}>{perc}%</div><div style={{fontSize:".72rem",color:C.text3,fontWeight:700,textTransform:"uppercase"}}>Desempenho</div></div>
              </div>
              {/* Step review */}
              <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:"2rem",flexWrap:"wrap"}}>
                {questoes.map((_,i)=>{const r=respostas.find(x=>x.idx===i);return <div key={i} className={r?(r.acerto?"ex-step correct":"ex-step wrong"):"ex-step"} style={{cursor:"default"}}>{r?(r.acerto?"✓":"✗"):(i+1)}</div>;})}
              </div>
              <div style={{display:"flex",gap:".75rem"}}>
                <button onClick={()=>{setPhase("select-module");setExercise(null);setTimerOn(false);}} className="ex-hdr-btn" style={{flex:1,justifyContent:"center",borderRadius:14,padding:14}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>Outro Exercício
                </button>
                <button onClick={onBack} style={{flex:1,padding:14,borderRadius:14,border:"none",background:`linear-gradient(135deg,${C.accent},${C.accent2})`,color:"#fff",cursor:"pointer",fontWeight:700,fontFamily:"inherit",fontSize:".9rem",boxShadow:"0 6px 20px rgba(37,99,235,.25)",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3"/></svg>Voltar à Plataforma
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function ModuleCard({m,onClick}:{m:ModuleGroup;onClick:()=>void}){
  const[h,setH]=useState(false);
  return(
    <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{background:C.surface,border:`1px solid ${h?C.accent:C.border}`,borderRadius:16,padding:"1.8rem 1.5rem",cursor:"pointer",textAlign:"left",transition:"all .25s",transform:h?"translateY(-4px)":"none",boxShadow:h?"0 12px 32px rgba(0,0,0,.07)":"none",fontFamily:"inherit",color:C.text}}>
      <div style={{fontSize:"2rem",marginBottom:".75rem"}}>{m.icone}</div>
      <div style={{fontWeight:800,fontSize:"1.05rem",marginBottom:4}}>{m.nome}</div>
      <div style={{fontSize:".78rem",color:C.text2}}>{m.count} exercício(s)</div>
      {m.categoria&&<div style={{marginTop:".75rem",fontSize:".68rem",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:C.accent,background:"rgba(37,99,235,.06)",padding:"3px 10px",borderRadius:6,display:"inline-block"}}>{m.categoria}</div>}
    </button>
  );
}
