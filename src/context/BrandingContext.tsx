import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { api, BACKEND_URL } from '@/services/api';

interface Branding {
  logoUrl: string | null;
  faviconUrl: string | null;
  splashUrl: string | null;
}

const BrandingContext = createContext<Branding>({
  logoUrl: null,
  faviconUrl: null,
  splashUrl: null,
});

export function BrandingProvider({ children }: PropsWithChildren) {
  const [branding, setBranding] = useState<Branding>({
    logoUrl: null,
    faviconUrl: null,
    splashUrl: null,
  });

  useEffect(() => {
    api.getBranding()
      .then(assets => {
        const get = (slot: string) => {
          const a = assets.find(x => x.slot === slot);
          return a ? `${BACKEND_URL}${a.imageUrl}` : null;
        };
        setBranding({
          logoUrl: get('logo'),
          faviconUrl: get('favicon'),
          splashUrl: get('splash'),
        });
      })
      .catch(() => {});
  }, []);

  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
