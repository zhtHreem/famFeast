import { useEffect } from 'react';

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · FamFeast` : 'FamFeast – Cook what you have, share what you love';
  }, [title]);
}
