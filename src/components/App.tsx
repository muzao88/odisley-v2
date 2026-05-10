"use client";

import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AuthModal from "./AuthModal";
import PaymentModal from "./PaymentModal";
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";
import ConteudoPage from "./pages/ConteudoPage";
import PlansPage from "./pages/PlansPage";
import AboutPage from "./pages/AboutPage";
import DashboardPage from "./pages/DashboardPage";
import WelcomePage from "./pages/WelcomePage";
import type { Page, AuthTab, PlanType } from "@/types";

function AppInner() {
  const [page, setPage] = useState<Page>("home");
  const [hasEntered, setHasEntered] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<AuthTab>("login");
  const [payOpen, setPayOpen] = useState(false);
  const [payPlan, setPayPlan] = useState<PlanType | null>(null);
  const [conteudoAtivo, setConteudoAtivo] = useState<{
    id: string;
    nome: string;
  } | null>(null);
  const { isLoggedIn, login, isInitialized } = useAuth();

  const navigate = (p: Page) => {
    setPage(p);
    setConteudoAtivo(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openAuth = (tab: AuthTab) => {
    setAuthTab(tab);
    setAuthOpen(true);
  };
  const openPayment = (plan: PlanType) => {
    setPayPlan(plan);
    setPayOpen(true);
  };

  const selectConteudo = (id: string, nome: string) => {
    setConteudoAtivo({ id, nome });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Lock scroll when modal open
  useEffect(() => {
    document.body.style.overflow = authOpen || payOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [authOpen, payOpen]);

  // Captura o token do Google após o redirect de volta ao site
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const google_token = params.get("google_token");
    const google_error = params.get("google_error");

    // Limpa a URL em qualquer caso
    if (google_token || google_error) {
      window.history.replaceState({}, "", "/");
    }

    if (google_error) {
      openAuth("login");
      return;
    }

    if (!google_token) return;

    // Faz login com o token recebido do Google
    fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: google_token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.token) {
           login(data.user, data.token);
           if (data.isNewUser) {
              // TODO: Abrir modal de atualização de nome
              setAuthOpen(true);
           }
        }
      })
      .catch(() => {});
  }, []);

  if (!isInitialized) return null;

  const content = (!isLoggedIn && !hasEntered) ? (
    <WelcomePage 
      onContinue={() => setHasEntered(true)} 
    />
  ) : (
    <>
      <Navbar currentPage={page} onNavigate={navigate} onOpenAuth={openAuth} />

      {conteudoAtivo ? (
        <ConteudoPage
          conteudoId={conteudoAtivo.id}
          conteudoNome={conteudoAtivo.nome}
          onNavigate={navigate}
          onOpenAuth={openAuth}
        />
      ) : (
        <>
          {page === "home" && (
            <HomePage onNavigate={navigate} onOpenAuth={openAuth} />
          )}
          {page === "cursos" && (
            <CoursesPage
              onNavigate={navigate}
              onSelectConteudo={selectConteudo}
              onOpenAuth={openAuth}
            />
          )}
          {page === "planos" && (
            <PlansPage onOpenAuth={openAuth} onOpenPayment={openPayment} />
          )}
          {page === "sobre" && <AboutPage onNavigate={navigate} />}
          {page === "dashboard" && isLoggedIn && (
            <DashboardPage
              onNavigate={navigate}
              onSelectConteudo={selectConteudo}
            />
          )}
          {page === "dashboard" && !isLoggedIn && (
            <div
              className="page"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "80vh",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ fontSize: "3rem" }}>🔒</div>
              <div
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                }}
              >
                Faça login para ver seu progresso
              </div>
              <button
                className="btn btn-primary btn-md"
                onClick={() => openAuth("login")}
              >
                Entrar
              </button>
            </div>
          )}
        </>
      )}

      <Footer onNavigate={navigate} />
    </>
  );

  return (
    <>
      {content}

      <AuthModal
        isOpen={authOpen}
        initialTab={authTab}
        onClose={() => setAuthOpen(false)}
      />
      <PaymentModal
        isOpen={payOpen}
        plan={payPlan}
        onClose={() => setPayOpen(false)}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
