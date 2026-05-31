/**
 * AuthLayout.jsx
 *
 * Wrapper compartido entre LoginPage y RegisterPage.
 * Controla la animación del panel de ilustración que "viaja"
 * de derecha (Login) a izquierda (Register) como un espejo.
 *
 * USO:
 *   <AuthLayout side="right" illustration={<MyIllustration />}>
 *     <MyForm />
 *   </AuthLayout>
 *
 * Props:
 *   side        → "left" | "right"  (dónde va el panel de ilustración)
 *   illustration → ReactNode        (contenido del panel de color)
 *   children    → ReactNode        (formulario)
 */

import { useEffect, useRef } from 'react';

const AuthLayout = ({ side = 'right', illustration, children }) => {
  const cardRef = useRef(null);

  /* Fuerza reflow para que la animación de entrada se dispare
     incluso si el componente ya estaba montado (cambio de ruta) */
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    card.classList.remove('auth-card-visible');
    // Un frame de gracia antes de añadir la clase visible
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        card.classList.add('auth-card-visible');
      });
    });
  }, [side]);

  const isLeft = side === 'left';

  return (
    <div className="auth-layout-bg min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div ref={cardRef} className="auth-card w-full max-w-6xl">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className={`flex flex-col ${isLeft ? 'md:flex-row-reverse' : 'md:flex-row'}`}>

            {/* Panel formulario */}
            <div className={`md:w-1/2 bg-white panel-form ${isLeft ? 'form-from-right' : 'form-from-left'}`}>
              {children}
            </div>

            {/* Panel ilustración */}
            <div className={`md:w-1/2 panel-illustration ${isLeft ? 'illus-from-left' : 'illus-from-right'}`}>
              {illustration}
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-layout-bg {
          background: #f1f5f9;
        }

        /* ── Tarjeta principal ── */
        .auth-card {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.45s cubic-bezier(0.22, 0.61, 0.36, 1),
                      transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        .auth-card-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── Paneles: entran desde lados opuestos ── */
        .panel-form,
        .panel-illustration {
          opacity: 0;
          transition: opacity 0.5s ease 0.1s, transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1) 0.1s;
        }

        /* Login → formulario viene de izquierda, ilustración de derecha */
        .form-from-left  { transform: translateX(-28px); }
        .illus-from-right { transform: translateX(28px); }

        /* Register → formulario viene de derecha, ilustración de izquierda */
        .form-from-right { transform: translateX(28px); }
        .illus-from-left { transform: translateX(-28px); }

        .auth-card-visible .panel-form,
        .auth-card-visible .panel-illustration {
          opacity: 1;
          transform: translateX(0);
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;