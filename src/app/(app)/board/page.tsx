
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/lib/project-store';
import Loading from '@/app/loading';

export default function BoardRedirectPage() {
  const router = useRouter();
  const { projects } = useProjectStore();

  useEffect(() => {
    if (projects.length > 0) {
      router.replace(`/projects/${projects[0].id}/board`);
    } else {
      router.replace('/projects');
    }
  }, [router, projects]);

  return <Loading />;
}
