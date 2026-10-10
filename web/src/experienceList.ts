import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import { getExperiences, type Experience } from './api';

export interface ExperienceList {
  // null until the list arrives.
  experiences: Experience[] | null;
  loadFailed: boolean;
}

// Fetches the project list once per visit. Layout calls it and hands the
// result to every page, so the list outlives moving between pages: coming
// back to the home page shows the cards on its first render. Cards arriving
// later would push About Me and Contact Me down after a #hash link had
// already scrolled to them, and Safari doesn't keep the position anchored.
export function useExperienceListLoader(): ExperienceList {
  const [state, setState] = useState<ExperienceList>({
    experiences: null,
    loadFailed: false,
  });

  useEffect(() => {
    const controller = new AbortController();
    void getExperiences(controller.signal).then(
      (experiences) => setState({ experiences, loadFailed: false }),
      () => {
        if (!controller.signal.aborted) {
          setState({ experiences: null, loadFailed: true });
        }
      },
    );
    return () => controller.abort();
  }, []);

  return state;
}

// The list Layout loaded, for a page rendered inside it.
export function useExperienceList(): ExperienceList {
  return useOutletContext<ExperienceList>();
}
