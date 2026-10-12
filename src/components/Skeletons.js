import React from 'react';
import { Box, Card, CardContent, Container, Grid, Skeleton, Stack } from '@mui/material';
import { RecipeCardSkeleton } from './RecipeCard';

export function ProfileSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }} aria-busy="true" aria-label="Loading profile">
      <Skeleton variant="rounded" sx={{ height: { xs: 130, md: 190 }, borderRadius: { xs: 3, md: 5 } }} />
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'center', md: 'flex-end' }} sx={{ px: { md: 4 }, mt: { xs: -7, md: -8 }, position: 'relative' }}>
        <Skeleton variant="circular" sx={{ width: { xs: 112, md: 136 }, height: { xs: 112, md: 136 }, border: '5px solid #000' }} />
        <Box sx={{ flexGrow: 1, width: '100%' }}>
          <Skeleton width="40%" height={44} />
          <Skeleton width="65%" />
        </Box>
      </Stack>
      <Stack direction="row" spacing={1.5} sx={{ mt: 3, px: { md: 4 } }}>
        {[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" width={96} height={62} sx={{ borderRadius: 3 }} />)}
      </Stack>
      <Box sx={{ mt: 5 }}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {[0, 1, 2, 3].map((i) => <Grid item xs={6} sm={4} md={3} key={i}><RecipeCardSkeleton /></Grid>)}
        </Grid>
      </Box>
    </Container>
  );
}

export function CookbookCardsSkeleton() {
  return (
    <Grid container spacing={3} aria-busy="true" aria-label="Loading cookbooks">
      {[0, 1, 2].map((i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Card>
            <CardContent>
              <Skeleton variant="circular" width={36} height={36} />
              <Skeleton width="60%" height={34} sx={{ mt: 1 }} />
              <Skeleton width="85%" />
              <Skeleton variant="rounded" width={90} height={24} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export function CookbookDetailSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }} aria-busy="true" aria-label="Loading cookbook">
      <Skeleton width={120} height={36} />
      <Skeleton width="45%" height={56} />
      <Skeleton width="60%" />
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ my: 4 }}>
        <Skeleton variant="rounded" height={96} sx={{ flex: 1, borderRadius: 3 }} />
        <Skeleton variant="rounded" height={96} sx={{ flex: 1, borderRadius: 3 }} />
      </Stack>
      <Grid container spacing={3}>
        {[0, 1, 2, 3].map((i) => <Grid item xs={6} sm={4} md={3} key={i}><RecipeCardSkeleton /></Grid>)}
      </Grid>
    </Container>
  );
}

export function CommentsSkeleton() {
  return (
    <Stack spacing={2.5} aria-busy="true" aria-label="Loading comments">
      {[0, 1, 2].map((i) => (
        <Box key={i}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Skeleton variant="circular" width={30} height={30} />
            <Skeleton width={120} />
          </Stack>
          <Skeleton width="80%" sx={{ ml: 5.5 }} />
        </Box>
      ))}
    </Stack>
  );
}

export function PantryResultsSkeleton() {
  return (
    <Grid container spacing={{ xs: 2, md: 3 }} aria-busy="true" aria-label="Finding recipes">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Card>
            <Skeleton variant="rectangular" height={160} />
            <CardContent>
              <Skeleton width="80%" height={28} />
              <Skeleton width="45%" />
              <Skeleton variant="rounded" height={6} sx={{ mt: 2 }} />
              <Stack direction="row" spacing={0.5} sx={{ mt: 2 }}>
                <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: 3 }} />
                <Skeleton variant="rounded" width={72} height={24} sx={{ borderRadius: 3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export function PeopleSkeleton() {
  return (
    <Stack spacing={1.5} sx={{ maxWidth: 560 }} aria-busy="true" aria-label="Loading">
      {[0, 1, 2, 3].map((i) => (
        <Stack key={i} direction="row" spacing={2} alignItems="center">
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton width="35%" />
            <Skeleton width="60%" />
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}
