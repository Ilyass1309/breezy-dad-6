export default function PrivacyPolicyPage() {
  return (
    <main className="p-10 max-w-3xl mx-auto text-base-content">
      <h1 className="text-3xl font-bold mb-4">Politique de confidentialité</h1>
      <p className="mb-4">
        Chez <strong>Breezy</strong>, nous accordons une grande importance à la
        protection de votre vie privée et de vos données personnelles. Cette
        politique de confidentialité explique comment nous collectons,
        utilisons, stockons et protégeons vos informations lorsque vous utilisez
        notre réseau social.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        1. Collecte des informations
      </h2>
      <p className="mb-2">
        Lors de votre inscription et de l’utilisation de Breezy, nous collectons
        les informations suivantes :
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>
          Informations d’identification : nom d’utilisateur, adresse e-mail, mot
          de passe.
        </li>
        <li>Informations de profil : photo, biographie, centres d’intérêt.</li>
        <li>
          Contenus partagés : publications, commentaires, messages privés.
        </li>
        <li>
          Données techniques : adresse IP, type d’appareil, navigateur, données
          de connexion.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        2. Utilisation des données
      </h2>
      <p className="mb-4">Vos données sont utilisées pour :</p>
      <ul className="list-disc list-inside mb-4">
        <li>Créer et gérer votre compte utilisateur.</li>
        <li>
          Permettre l’utilisation des fonctionnalités sociales (publications,
          abonnements, messagerie, etc.).
        </li>
        <li>
          Améliorer l’expérience utilisateur et la sécurité de la plateforme.
        </li>
        <li>
          Vous envoyer des notifications ou des informations importantes
          concernant votre compte.
        </li>
        <li>
          Analyser l’utilisation de Breezy de façon anonyme pour améliorer nos
          services.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        3. Partage des informations
      </h2>
      <p className="mb-4">
        Nous ne partageons jamais vos données personnelles avec des tiers sans
        votre consentement, sauf dans les cas suivants :
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Obligation légale ou demande des autorités compétentes.</li>
        <li>
          Protection des droits, de la sécurité ou de la propriété de Breezy ou
          de ses utilisateurs.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Sécurité</h2>
      <p className="mb-4">
        Nous mettons en œuvre des mesures techniques et organisationnelles
        appropriées pour protéger vos données contre tout accès, modification,
        divulgation ou destruction non autorisés.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Vos droits</h2>
      <p className="mb-4">
        Vous disposez d’un droit d’accès, de rectification, de suppression et de
        portabilité de vos données. Vous pouvez également vous opposer ou
        limiter certains traitements. Pour exercer vos droits, contactez-nous à
        l’adresse ci-dessous.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        6. Conservation des données
      </h2>
      <p className="mb-4">
        Vos données sont conservées tant que votre compte est actif ou selon les
        obligations légales en vigueur. Vous pouvez demander la suppression de
        votre compte à tout moment.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Contact</h2>
      <p className="mb-4">
        Pour toute question concernant cette politique ou vos données
        personnelles, vous pouvez nous contacter à&nbsp;
        <a href="mailto:contact@breezy.com" className="text-primary underline">
          contact@breezy.com
        </a>
      </p>

      <p className="text-sm text-base-content/60 mt-8">
        Dernière mise à jour&nbsp;: 24 juin 2025
      </p>
    </main>
  );
}
