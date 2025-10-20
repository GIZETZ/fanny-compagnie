import { Button } from "@/components/ui/button";

export default function PendingRole() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary">
          <span className="text-primary-foreground font-bold text-2xl">F&C</span>
        </div>
        <h1 className="text-2xl font-semibold">Votre compte est en attente d'attribution de rôle</h1>
        <p className="text-muted-foreground">
          Un superviseur doit vous attribuer un rôle (caissière, gestionnaire de stock, RH, client, superviseur) pour accéder aux modules.
        </p>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Si vous êtes superviseur, connectez-vous avec un compte superviseur pour gérer les rôles.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="secondary"
              onClick={() => (window.location.href = "/api/logout")}
            >
              Changer de compte
            </Button>
            <Button onClick={() => (window.location.href = "/")}>Revenir à l'accueil</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
