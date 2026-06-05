"use client";

import React, { useState } from "react";
import type { PlanType } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: PlanType) => void;
}

export default function UpgradeModal({ isOpen, onClose, onSelectPlan }: Props) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="upgrade-modal-container"
        style={{
          maxWidth: "760px",
          width: "100%",
          backgroundColor: "#0d111a",
          borderRadius: "24px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "40px",
          position: "relative",
          boxShadow: "0 30px 60px rgba(0, 0, 0, 0.7)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          gap: "30px",
          boxSizing: "border-box",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
            color: "#9ca3af",
            zIndex: 10,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              margin: "0 0 10px 0",
              fontFamily: "'Syne', sans-serif",
              background: "linear-gradient(135deg, #ffffff 60%, #9ca3af 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Escolha seu Plano Premium ⭐
          </h2>
          <p style={{ fontSize: "1rem", color: "#9ca3af", margin: 0, lineHeight: 1.5 }}>
            Desbloqueie acesso ilimitado a todas as videoaulas, exercícios e resoluções completas.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="plans-grid">
          {/* Plano Mensal */}
          <div
            className="plan-card-mensal"
            style={{
              flex: 1,
              backgroundColor: "#161d30",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "18px",
              padding: "30px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "all 0.3s ease",
              cursor: "pointer",
              position: "relative",
              boxSizing: "border-box",
            }}
            onClick={() => onSelectPlan("mensal")}
          >
            <div>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                Plano Mensal
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#9ca3af", margin: "0 0 20px 0" }}>
                Ideal para experimentar e estudar no seu próprio ritmo.
              </p>

              <div style={{ display: "flex", alignItems: "baseline", marginBottom: "25px" }}>
                <span style={{ fontSize: "2rem", fontWeight: 800, color: "#fff" }}>R$ 39</span>
                <span style={{ fontSize: "0.9rem", color: "#9ca3af", marginLeft: "4px" }}>/mês</span>
              </div>

              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  paddingTop: "20px",
                  marginBottom: "30px",
                }}
              >
                {[
                  "200+ videoaulas liberadas",
                  "Exercícios práticos com correção",
                  "Simulados completos do ENEM",
                  "Cancele quando quiser",
                ].map((feat, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontSize: "0.85rem",
                      color: "#d1d5db",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ color: "#3fcf8e", fontWeight: "bold" }}>✓</span>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <button
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                color: "#fff",
                padding: "14px",
                borderRadius: "10px",
                border: "none",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                width: "100%",
                transition: "all 0.2s ease",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPlan("mensal");
              }}
            >
              Assinar Plano Mensal
            </button>
          </div>

          {/* Plano Anual */}
          <div
            className="plan-card-anual"
            style={{
              flex: 1,
              background: "linear-gradient(145deg, #1b2640, #131b2e)",
              border: "2px solid #1a4fd6",
              borderRadius: "18px",
              padding: "30px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "all 0.3s ease",
              cursor: "pointer",
              position: "relative",
              boxSizing: "border-box",
              boxShadow: "0 10px 30px rgba(26, 79, 214, 0.15)",
            }}
            onClick={() => onSelectPlan("anual")}
          >
            {/* Badge Destaque */}
            <div
              style={{
                position: "absolute",
                top: "-14px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#3fcf8e",
                color: "#0b0f19",
                fontSize: "0.75rem",
                fontWeight: 800,
                padding: "6px 14px",
                borderRadius: "20px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                boxShadow: "0 4px 12px rgba(63, 207, 142, 0.3)",
                whiteSpace: "nowrap",
              }}
            >
              🔥 Melhor Valor / Economize 26%
            </div>

            <div>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                Plano Anual
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#9ca3af", margin: "0 0 20px 0" }}>
                Acesso completo de longo prazo e suporte premium.
              </p>

              <div style={{ display: "flex", alignItems: "baseline", marginBottom: "25px" }}>
                <span style={{ fontSize: "2rem", fontWeight: 800, color: "#fff" }}>R$ 29</span>
                <span style={{ fontSize: "0.9rem", color: "#9ca3af", marginLeft: "4px" }}>/mês</span>
              </div>

              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  paddingTop: "20px",
                  marginBottom: "30px",
                }}
              >
                {[
                  "Tudo do Plano Mensal incluído",
                  "Suporte prioritário via WhatsApp",
                  "Correção detalhada de redação",
                  "Preparação premium completa",
                ].map((feat, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontSize: "0.85rem",
                      color: "#d1d5db",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ color: "#3fcf8e", fontWeight: "bold" }}>✓</span>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <button
              style={{
                backgroundColor: "#1a4fd6",
                color: "#fff",
                padding: "14px",
                borderRadius: "10px",
                border: "none",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                width: "100%",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 14px rgba(26, 79, 214, 0.3)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPlan("anual");
              }}
            >
              Assinar Plano Anual
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .plans-grid {
          display: flex;
          gap: 24px;
          width: 100%;
        }
        .plan-card-mensal:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.2) !important;
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        }
        .plan-card-anual:hover {
          transform: translateY(-4px);
          border-color: #3fcf8e !important;
          box-shadow: 0 15px 40px rgba(26, 79, 214, 0.25) !important;
        }
        .plan-card-mensal:hover button {
          background-color: rgba(255, 255, 255, 0.15) !important;
        }
        .plan-card-anual:hover button {
          background-color: #2563eb !important;
        }
        @media (max-width: 640px) {
          .upgrade-modal-container {
            padding: 35px 20px 25px 20px !important;
            gap: 24px !important;
            max-height: 95vh;
            overflow-y: auto;
          }
          .plans-grid {
            flex-direction: column;
            gap: 20px;
          }
          .upgrade-modal-container h2 {
            font-size: 1.6rem !important;
          }
        }
      `}</style>
    </div>
  );
}
