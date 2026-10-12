import React from 'react';
import { Box, Card, CardActionArea, CardContent, Chip, Skeleton, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LockIcon from '@mui/icons-material/Lock';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { imageSrc, imageSrcSet } from '../utils/images';

const CARD_SIZES = '(min-width:1200px) 280px, (min-width:900px) 25vw, (min-width:600px) 33vw, 50vw';

export function RecipeImage({ src, alt, height = 190, sizes = CARD_SIZES, full = false }) {
  const [failed, setFailed] = React.useState(false);
  if (!src || failed) {
    return (
      <Box sx={{ height, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #20261a, #1B1212)', color: 'primary.main' }}>
        <RestaurantIcon sx={{ fontSize: 48, opacity: 0.8 }} />
      </Box>
    );
  }
  return (
    <Box
      component="img"
      src={imageSrc(src, full ? 'large' : 'medium')}
      srcSet={imageSrcSet(src)}
      sizes={sizes}
      alt={alt}
      loading={full ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      sx={{ width: '100%', height, objectFit: 'cover', display: 'block', backgroundColor: '#140d0d' }}
    />
  );
}

export default function RecipeCard({ recipe, footer }) {
  const id = recipe._id || recipe.id;
  const time = recipe.totalTime;
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform .2s', '&:hover': { transform: 'translateY(-4px)' } }}>
      <CardActionArea component={Link} to={`/recipe/${id}`} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start' }}>
        <Box sx={{ position: 'relative' }}>
          <RecipeImage src={recipe.image} alt={recipe.name} />
          {recipe.visibility === 'cookbook' && (
            <Chip size="small" icon={<LockIcon />} label="Family only" color="secondary" sx={{ position: 'absolute', top: 10, left: 10 }} />
          )}
        </Box>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h3" sx={{ fontSize: '1.05rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.7em' }}>
            {recipe.name}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1, color: 'text.secondary' }}>
            {recipe.cuisine && <Typography variant="caption">{recipe.cuisine}</Typography>}
            {recipe.cuisine && recipe.category && <Typography variant="caption">·</Typography>}
            {recipe.category && <Typography variant="caption">{recipe.category}</Typography>}
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ mt: 1, color: 'text.secondary' }} alignItems="center">
            {time ? (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <ScheduleIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption">{time} min</Typography>
              </Stack>
            ) : null}
            {recipe.ratingCount > 0 && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <StarIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                <Typography variant="caption">{recipe.ratingAvg} ({recipe.ratingCount})</Typography>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
      {footer}
    </Card>
  );
}

export function RecipeCardSkeleton() {
  return (
    <Card sx={{ height: '100%' }}>
      <Skeleton variant="rectangular" height={190} />
      <CardContent>
        <Skeleton width="85%" />
        <Skeleton width="55%" />
      </CardContent>
    </Card>
  );
}
