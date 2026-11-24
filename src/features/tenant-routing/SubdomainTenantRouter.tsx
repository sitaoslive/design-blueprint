import React, { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  resolveTenantByHostname,
  PlatformTenant,
} from "@/features/system-administration/application/platformControlPlane";
import { DrLuisClinicLanding } from "./DrLuisClinicLanding";
import { WhiteLabelVetClinicLanding } from "./WhiteLabelVetClinicLanding";
import { WhiteLabelContractorLanding } from "./WhiteLabelContractorLanding";

export type ResolvedViewType =
  | "DR_LUIS_CLINIC"
  | "WHITE_LABEL_VET"
  | "WHITE_LABEL_CONTRACTOR"
  | "PLATFORM_ADMIN"
  | "MASTER_PUBLIC";

export function useSubdomainResolution() {
  const [resolution, setResolution] = useState<{
    viewType: ResolvedViewType;
    tenant?: PlatformTenant | undefined;
    isLoading: boolean;
  }>({
    viewType: "MASTER_PUBLIC",
    isLoading: true,
  });

  useEffect(() => {
    async function determineView() {
      if (typeof window === "undefined") {
        setResolution({ viewType: "MASTER_PUBLIC", isLoading: false });
        return;
      }

      const hostname = window.location.hostname.toLowerCase().trim();
      const searchParams = new URLSearchParams(window.location.search);
      const forcedSubdomain = (
        searchParams.get("subdomain") ||
        searchParams.get("tenant") ||
        ""
      ).toLowerCase().trim();

      // 1. Caso Explícito: Dr. Luis Ríos (luis.alphavisionm.com o ?subdomain=luis)
      if (
        forcedSubdomain === "luis" ||
        hostname === "luis.alphavisionm.com" ||
        hostname.startsWith("luis.")
      ) {
        setResolution({ viewType: "DR_LUIS_CLINIC", isLoading: false });
        return;
      }

      // 2. Caso Explícito: Super Admin (admin.alphavisionm.com o ?subdomain=admin)
      if (
        forcedSubdomain === "admin" ||
        hostname === "admin.alphavisionm.com" ||
        hostname.startsWith("admin.")
      ) {
        setResolution({ viewType: "PLATFORM_ADMIN", isLoading: false });
        return;
      }

      // 3. Caso Explícito: Dominio Central Maestro (alphavisionm.com o www.alphavisionm.com)
      if (
        (hostname === "alphavisionm.com" ||
          hostname === "www.alphavisionm.com" ||
          hostname === "localhost" ||
          hostname === "127.0.0.1") &&
        !forcedSubdomain
      ) {
        setResolution({ viewType: "MASTER_PUBLIC", isLoading: false });
        return;
      }

      // 4. Subdominio Dinámico para Clínicas o Contratistas (<nombre>.alphavisionm.com o ?subdomain=<slug>)
      const targetLookupHost = forcedSubdomain
        ? `${forcedSubdomain}.alphavisionm.com`
        : hostname;

      try {
        const resolved = await resolveTenantByHostname(targetLookupHost);

        if (resolved.product_type === "VET_LIFE") {
          setResolution({
            viewType: "WHITE_LABEL_VET",
            tenant: {
              id: resolved.tenant_id || "tenant-vet",
              tenant_id: resolved.tenant_id || "tenant-vet",
              legal_name: resolved.display_name || "Clínica Veterinaria Afiliada",
              display_name: resolved.display_name || "Clínica Veterinaria Afiliada",
              normalized_slug: resolved.normalized_slug || "clinica",
              product_type: "VET_LIFE",
              industry: "VETERINARY",
              exact_niche: "Clínica Veterinaria & Domicilios",
              country: "Colombia",
              currency: "COP",
              time_zone: "America/Bogota",
              account_status: resolved.account_status || "ACTIVE_PAID",
              onboarding_status: "COMPLETED",
              provisioning_status: "SUCCESS",
              billing_status: "PAID",
              plan_code: "TIER2_CLINICA",
              plan_name: "Clínica Domiciliaria Pro",
              hostname: targetLookupHost,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            isLoading: false,
          });
          return;
        }

        if (resolved.product_type === "CONTRACTOR_OS") {
          setResolution({
            viewType: "WHITE_LABEL_CONTRACTOR",
            tenant: {
              id: resolved.tenant_id || "tenant-contractor",
              tenant_id: resolved.tenant_id || "tenant-contractor",
              legal_name: resolved.display_name || "Servicios de Campo Pro",
              display_name: resolved.display_name || "Servicios de Campo Pro",
              normalized_slug: resolved.normalized_slug || "contractor",
              product_type: "CONTRACTOR_OS",
              industry: "FIELD_SERVICE",
              exact_niche: "Servicios de Campo, Instalaciones & Mantenimiento",
              country: "Colombia",
              currency: "USD",
              time_zone: "America/Bogota",
              account_status: resolved.account_status || "ACTIVE_PAID",
              onboarding_status: "COMPLETED",
              provisioning_status: "SUCCESS",
              billing_status: "PAID",
              plan_code: "CONTRACTOR_GROWTH",
              plan_name: "Growth Pro",
              hostname: targetLookupHost,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            isLoading: false,
          });
          return;
        }

        if (resolved.resolution_type === "PLATFORM_ADMIN") {
          setResolution({ viewType: "PLATFORM_ADMIN", isLoading: false });
          return;
        }
      } catch {
        // Fallback en caso de error
      }

      setResolution({ viewType: "MASTER_PUBLIC", isLoading: false });
    }

    void determineView();
  }, []);

  return resolution;
}

export function AdminAutoRedirect() {
  const nav = useNavigate();
  useEffect(() => {
    void nav({ to: "/admin/login" });
  }, [nav]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono">Redirigiendo a Super Admin Command Center...</p>
      </div>
    </div>
  );
}
