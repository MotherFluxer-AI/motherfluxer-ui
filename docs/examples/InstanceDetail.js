import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  CircularProgress,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ContentCopy as ContentCopyIcon,
  Check as CheckIcon,
  VpnKey as VpnKeyIcon
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../services/api';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ModelTester from '../../components/ModelTester';

function InstanceDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [instance, setInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(location.state?.edit || false);
  const [formData, setFormData] = useState({
    is_active: true,
    version: '',
    container_version: '',
    model_provider: '',
    model_name: '',
    model_parameters: {}
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
  const [newToken, setNewToken] = useState(null);
  const [copied, setCopied] = useState({
    token: false,
    command: false
  });

  useEffect(() => {
    fetchInstanceData();
  }, [id]);

  const fetchInstanceData = async () => {
    setLoading(true);
    try {
      // First get the instance data
      const response = await api.get(`/admin/instances/${id}`);
      const instanceData = response.data.data.instance;
      
      // Then get the connection details including the token
      const connectionResponse = await api.get(`/admin/instances/${id}/connection`);
      const connectionData = connectionResponse.data.data;
      
      setInstance({
        ...instanceData,
        token: connectionData.token,
        ws_url: connectionData.ws_url
      });
      
      setFormData({
        is_active: instanceData.is_active,
        version: instanceData.version || '',
        container_version: instanceData.container_version || '',
        model_provider: instanceData.model_provider || '',
        model_name: instanceData.model_name || '',
        model_parameters: instanceData.model_parameters || {}
      });
    } catch (error) {
      setError('Failed to load instance data');
      console.error('Error fetching instance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'is_active' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.patch(`/admin/instances/${id}`, formData);
      setInstance(response.data.data.instance);
      setEditMode(false);
    } catch (error) {
      setError('Failed to update instance');
      console.error('Error updating instance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/instances/${id}`);
      navigate('/instances');
    } catch (error) {
      setError('Failed to delete instance');
      console.error('Error deleting instance:', error);
    }
  };

  const handleRegenerateToken = async () => {
    try {
      const response = await api.post(`/admin/instances/${id}/token`);
      const tokenData = response.data.data;
      
      // Update the instance state with the new token
      setInstance(prev => ({
        ...prev,
        token: tokenData.token
      }));
      
      // Set the new token data for the dialog
      setNewToken(tokenData);
      setTokenDialogOpen(true);
      
      // Refresh the instance data to ensure we have the latest state
      fetchInstanceData();
    } catch (error) {
      setError('Failed to regenerate token');
      console.error('Error regenerating token:', error);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(prev => ({ ...prev, [field]: true }));
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [field]: false }));
      }, 2000);
    });
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 50) return 'warning';
    return 'error';
  };

  if (loading && !instance) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/instances')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {instance?.instance_name}
        </Typography>
        {!editMode && (
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />}
              onClick={() => setEditMode(true)}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button 
              variant="outlined" 
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {editMode ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Edit Instance
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={handleChange}
                      name="is_active"
                      color="primary"
                    />
                  }
                  label="Active"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Model Provider"
                  name="model_provider"
                  value={formData.model_provider}
                  onChange={handleChange}
                  fullWidth
                  helperText="The provider of the model (e.g., OpenAI, Anthropic)"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Model Name"
                  name="model_name"
                  value={formData.model_name}
                  onChange={handleChange}
                  fullWidth
                  helperText="The specific model name (e.g., gpt-4, claude-3)"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Model Version"
                  name="version"
                  value={formData.version}
                  onChange={handleChange}
                  fullWidth
                  helperText="The version of the model you're deploying"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Container Version"
                  name="container_version"
                  value={formData.container_version}
                  onChange={handleChange}
                  fullWidth
                  helperText="The container version to use (default: latest)"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => setEditMode(false)}
                    sx={{ mr: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Instance Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Chip 
                      label={instance?.is_active ? 'Active' : 'Inactive'} 
                      color={instance?.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Health
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Chip 
                      label={`${instance?.health_score}%`} 
                      color={getHealthColor(instance?.health_score)}
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Created
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {new Date(instance?.registered_at).toLocaleString()}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Last Health Check
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {instance?.last_health_check 
                        ? new Date(instance.last_health_check).toLocaleString()
                        : 'Never'
                      }
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Host Address
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {instance?.host_address}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Model Version
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {instance?.version || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Container Version
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {instance?.container_version || 'latest'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Model Provider
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {instance?.model_provider || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Model Name
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {instance?.model_name || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <ModelTester 
                  instanceToken={instance?.token} 
                  instanceUrl={instance?.host_address} 
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">
                    Authentication
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<VpnKeyIcon />}
                    onClick={handleRegenerateToken}
                    size="small"
                  >
                    Regenerate Token
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  If you need to regenerate your instance token, click the button above.
                  Note that this will invalidate the previous token.
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">
                    Deployment
                  </Typography>
                  <IconButton onClick={fetchInstanceData}>
                    <RefreshIcon />
                  </IconButton>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body2" gutterBottom>
                  Docker command to update your instance:
                </Typography>
                <TextField
                  value={`docker run -e INSTANCE_TOKEN=<your-token> -p 8000:8000 motherfluxer/model:${instance?.container_version || 'latest'}`}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Copy to clipboard">
                          <IconButton
                            onClick={() => copyToClipboard(`docker run -e INSTANCE_TOKEN=<your-token> -p 8000:8000 motherfluxer/model:${instance?.container_version || 'latest'}`, 'command')}
                            edge="end"
                          >
                            {copied.command ? <CheckIcon color="success" /> : <ContentCopyIcon />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="body2" color="text.secondary">
                  Replace <code>&lt;your-token&gt;</code> with your instance token.
                  For security reasons, we don't display the token here.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Instance"
        content={`Are you sure you want to delete the instance "${instance?.instance_name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      {/* New Token Dialog */}
      <Dialog open={tokenDialogOpen} onClose={() => setTokenDialogOpen(false)}>
        <DialogTitle>New Instance Token</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Your previous token has been invalidated. Save this new token securely.
          </Alert>
          <Typography variant="subtitle2" gutterBottom>
            Token:
          </Typography>
          <TextField
            value={newToken?.token || ''}
            fullWidth
            variant="outlined"
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={copied.token ? "Copied!" : "Copy to clipboard"}>
                    <IconButton
                      onClick={() => copyToClipboard(newToken?.token, 'token')}
                      edge="end"
                    >
                      {copied.token ? <CheckIcon color="success" /> : <ContentCopyIcon />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />
          
          <Typography variant="subtitle2" gutterBottom>
            Update Command:
          </Typography>
          <TextField
            value={newToken?.deployment_instructions.update_command || ''}
            fullWidth
            variant="outlined"
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={copied.command ? "Copied!" : "Copy to clipboard"}>
                    <IconButton
                      onClick={() => copyToClipboard(newToken?.deployment_instructions.update_command, 'command')}
                      edge="end"
                    >
                      {copied.command ? <CheckIcon color="success" /> : <ContentCopyIcon />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTokenDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default InstanceDetail; 