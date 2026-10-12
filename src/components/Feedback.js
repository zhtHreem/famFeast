import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar } from '@mui/material';

const FeedbackContext = createContext(null);

// Toasts + promise-based confirm dialog, replacing SweetAlert popups.
export function FeedbackProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [dialog, setDialog] = useState(null);
  const resolver = useRef(null);

  const notify = useCallback((message, severity = 'success') => setToast({ message, severity, key: Date.now() }), []);

  const confirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setDialog(typeof opts === 'string' ? { title: opts } : opts);
      }),
    []
  );

  const close = (result) => {
    setDialog(null);
    resolver.current?.(result);
  };

  const value = useMemo(() => ({ notify, confirm }), [notify, confirm]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <Snackbar
        key={toast?.key}
        open={Boolean(toast)}
        autoHideDuration={4500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert onClose={() => setToast(null)} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
      <Dialog open={Boolean(dialog)} onClose={() => close(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{dialog?.title}</DialogTitle>
        {dialog?.text && (
          <DialogContent>
            <DialogContentText>{dialog.text}</DialogContentText>
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => close(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={() => close(true)} variant="contained" color={dialog?.danger ? 'error' : 'primary'}>
            {dialog?.confirmLabel || 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </FeedbackContext.Provider>
  );
}

export const useFeedback = () => useContext(FeedbackContext);
