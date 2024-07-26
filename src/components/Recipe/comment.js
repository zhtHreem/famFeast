import React, { useState } from "react";
import { Box,List, TextField ,Button, ListItemText,ListItem, Typography, Stack, Paper,CardContent,Card} from "@mui/material";
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import  AddCircle from "@mui/icons-material";



const Comment = ({ comment, addReply }) => {
    const [replyText, setReplyText] = useState('');
    const [replyName, setReplyName] = useState('ReplyUser');
    const [like, setLike] = useState(false);
    const [replyIcon,setReplyIcon]=useState(false);

    const handleAddReply = () => {
      if (replyText.trim()) {
        addReply(comment.id, replyText,replyName);
        setReplyText('');
        setReplyIcon(false); 
      }
    };

    const handleLike=()=>{
        setLike(prevState=> !prevState)
       }

    const handleReplyIcon=()=>{
        setReplyIcon(prevState=> !prevState)
       }   
  
    return (
      
        <Box sx={{borderLeft: "1px ridge black",display: 'flex', flexDirection: 'column',padding:3,marginBottom: 2}}>


           <Stack direction="row" alignItems="center">
                <Box component="img" src={require("../../images/useravatar.png")}  alt="User Avatar"  sx={{ width: 40, height: 40, borderRadius: '50%' }} />
                <Typography variant="h6" >{comment.name}</Typography>
           </Stack>
          <Typography variant="body1" marginLeft={3} >{comment.text}</Typography>
          
          

         

          <Stack direction="row" alignItems="center" spacing={2} marginLeft={2} p={2}>
                                { like? (
                                    <ThumbUpAltIcon onClick={handleLike}/>
                                ) :(
                                    <ThumbUpOffAltIcon onClick={handleLike}/>
                                )}

                               <ChatBubbleIcon onClick={handleReplyIcon}  />
          </Stack>
         
          

          {comment.replies.map(reply => (
            <Comment key={reply.id} comment={reply} addReply={addReply} />
          ))}


          { replyIcon && (
            <Box mt={2}>
                <TextField   label="Reply" value={replyText}  onChange={(e) => setReplyText(e.target.value)}   multiline rows={4}  sx={{ width: "100%", border: "1px ridge white" }}   />
                <Button onClick={handleAddReply} sx={{ height: "56px", backgroundColor: "orange", color: "white", border: "1px ridge white", marginTop: 2 }}>
                   Reply
                </Button>
                </Box>   
            )}

            


       </Box>  
       
    );
  };


  const CommentSection = () => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commenterName,setCommenterName]=useState('CommentUser')
  
    const addComment = () => {
      setComments([...comments, { id: Date.now(),  text: newComment,name:commenterName, replies: [] }]);
      setNewComment('');
    };
  
    const addReply = (commentId, text,name) => {
      const addReplyRecursively = (comments, commentId, text,name) => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, replies: [...comment.replies, { id: Date.now(), text,name, replies: [] }] };
          }
          return { ...comment, replies: addReplyRecursively(comment.replies, commentId, text,name) };
        });
      };
  
      setComments(addReplyRecursively(comments, commentId, text,name));
    };
  


    return (
     <Box p={7}  >
       <Typography variant="h4" paddingBottom={3}>Comments</Typography>
       {comments.map(comment => (
          <Comment key={comment.id} comment={comment} addReply={addReply} />
        ))}

       <TextField  label="Add a Comment" value={newComment} multiline rows={6} onChange={(e)=>setNewComment(e.target.value)} sx={{width:"90%",border: "1px ridge white",color:"white"}}/>
        <Button onClick={addComment} sx={{height:"56px",backgroundColor:"orange",color:"white",border: "1px ridge white",marginTop:2}}  >Submit</Button>
    
      
        

      </Box>
    );
  };
  

export default CommentSection;
