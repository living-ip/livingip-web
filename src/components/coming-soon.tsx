export function ComingSoon() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
        padding: "2rem",
        textAlign: "center",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <svg
          viewBox="0 0 1033 1033"
          width="56"
          height="56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1033 -4.51539e-05L1033 893.496C1033 970.459 970.61 1033 893.496 1033L0 1033L-7.96247e-06 850.84L601.813 850.84L79.3578 549.201L170.438 391.445L693.172 693.246L391.36 170.492L549.115 79.412L850.84 602.014L850.84 -3.71914e-05L1033 -4.51539e-05Z"
            fill="#6E46E5"
          />
        </svg>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            fontSize: "44px",
            letterSpacing: "-0.03em",
            color: "var(--text)",
            lineHeight: 1,
          }}
        >
          teleo
        </span>
      </div>
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "1.125rem",
          fontFamily: "var(--font-sans)",
          letterSpacing: "0.02em",
        }}
      >
        Coming soon.
      </p>
    </div>
  );
}
