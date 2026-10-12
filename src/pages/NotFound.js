import React from 'react';
import { Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import EmptyState from '../components/EmptyState';
import usePageTitle from '../hooks/usePageTitle';

export default function NotFound() {
  usePageTitle('Page not found');
  return (
    <Container maxWidth="sm">
      <EmptyState icon={<SentimentDissatisfiedIcon />} title="This page burned in the oven" text="We couldn't find what you were looking for." action={<Button component={Link} to="/" variant="contained">Back to home</Button>} />
    </Container>
  );
}
