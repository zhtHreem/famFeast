import React, { useState, useEffect } from "react"; 
import { Box, TextField, Button, Typography, Stack } from "@mui/material";
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import axios from 'axios';

const Comment = ({ comment, addReply, parentId }) => {
    const [replyText, setReplyText] = useState('');
    const [replyName, setReplyName] = useState('ReplyUser');
    const [like, setLike] = useState(false);
    const [replyIcon, setReplyIcon] = useState(false);

    const handleAddReply = () => {
        if (replyText.trim()) {
            addReply(parentId || comment._id, replyText, replyName); // Pass parentId or comment._id
            setReplyText('');
            setReplyIcon(false);
        }
    };

    const handleLike = () => {
        setLike(prevState => !prevState);
    };

    const handleReplyIcon = () => {
        setReplyIcon(prevState => !prevState);
    };

    return (
        <Box sx={{ borderLeft: "1px ridge black", display: 'flex', flexDirection: 'column', padding: 3, marginBottom: 2 }}>
            <Stack direction="row" alignItems="center">
                <Box component="img" src={require("../../images/useravatar.png")} alt="User Avatar" sx={{ width: 40, height: 40, borderRadius: '50%' }} />
                <Typography variant="h6">{comment.name}</Typography>
            </Stack>
            <Typography variant="body1" marginLeft={3}>{comment.text}</Typography>

            <Stack direction="row" alignItems="center" spacing={2} marginLeft={2} p={2}>
                {like ? (
                    <ThumbUpAltIcon onClick={handleLike} />
                ) : (
                    <ThumbUpOffAltIcon onClick={handleLike} />
                )}
                <ChatBubbleIcon onClick={handleReplyIcon} />
            </Stack>

            {comment.replies && Array.isArray(comment.replies) && comment.replies.map(reply => (
                <Comment key={reply._id} comment={reply} addReply={addReply} parentId={comment._id} />
            ))}

            {replyIcon && (
                <Box mt={2}>
                    <TextField 
                        label="Reply" 
                        value={replyText} 
                        onChange={(e) => setReplyText(e.target.value)} 
                        multiline 
                        rows={4} 
                        sx={{ width: "100%", border: "1px ridge white" }} 
                    />
                    <Button onClick={handleAddReply} sx={{ height: "56px", backgroundColor: "orange", color: "white", border: "1px ridge white", marginTop: 2 }}>
                        Reply
                    </Button>
                </Box>
            )}
        </Box>
    );
};

const CommentSection = ({ recipeId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commenterName, setCommenterName] = useState('');

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setCommenterName(storedUser.name);
        }
    }, []);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await axios.get(`https://fam-feast-api.vercel.app/api/comments?recipeId=${recipeId}`); 
                setComments(response.data);
            } catch (err) {
                console.error('Failed to fetch comments:', err);
            }
        };

        fetchComments();
    }, [recipeId]); 

    const addComment = async () => {
        try {
            const response = await axios.post('https://fam-feast-api.vercel.app/api/comments', {
                name: commenterName,
                text: newComment,
                recipeId 
            });

            setComments([...comments, response.data]);
            setNewComment('');
        } catch (err) {
            console.error('Failed to add comment:', err);
        }
    };

    const addReply = async (commentId, text, name) => {
        try {
            const response = await axios.post(`https://fam-feast-api.vercel.app/api/comments/${commentId}/replies`, {
                name:commenterName,
                text
            });

            const updatedComments = comments.map(comment =>
                comment._id === response.data._id ? response.data : comment
            );

            setComments(updatedComments);
        } catch (err) {
            console.error('Failed to add reply:', err);
        }
    };

    return (
        <Box p={7}>
            <Typography variant="h4" paddingBottom={3}>Comments</Typography>
            {comments.map(comment => (
                <Comment key={comment._id} comment={comment} addReply={addReply} />
            ))}

            <TextField 
                label="Add a Comment" 
                value={newComment} 
                multiline 
                rows={6} 
                onChange={(e) => setNewComment(e.target.value)} 
                sx={{ width: "90%", border: "1px ridge white", color: "white" }} 
            />
            <Button onClick={addComment} sx={{ height: "56px", backgroundColor: "orange", color: "white", border: "1px ridge white", marginTop: 2 }}>
                Submit
            </Button>
        </Box>
    );
};

export default CommentSection;
