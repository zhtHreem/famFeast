import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../layout/layout';
import { Typography, Grid, Card, CardMedia, CardContent } from '@mui/material';

const SearchResults = () => {
  const { query } = useParams(); // Extract the query from URL params
  console.log("param:", query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await axios.get(`http://localhost:5000/api/recipes/search?recipe=${query}`);
        console.log("response:", response);
        setResults(response.data);
      } catch (error) {
        setError('An error occurred while fetching search results.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Layout>
      <Typography textAlign="center"  variant="h2" padding={7}  zIndex={3}>  Search Results  </Typography>
      <Grid container  justifyContent="center" spacing={3} px={12} paddingRight={3} paddingBottom={4}>
        {results.map(recipe => (
          <Grid item xs={12} sm={6} md={4} zIndex={3} key={recipe._id}>
            <Link to={`/recipe/${recipe._id}`} style={{ textDecoration: 'none' }}>
              <Card sx={{ maxWidth: 345, backgroundColor: "#1B1212", borderRadius: '16px' }}>
                <CardMedia
                  component="img"
                  image={`http://localhost:5000/upload/${recipe.image}`}
                  sx={{ height: 300, objectFit: 'fill' }}
                />
                <CardContent>
                  <Typography color="white" textAlign="center" fontFamily='Fredoka One, sans-serif' variant="h5">
                    {recipe.name}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
};

export default SearchResults;
