import React from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button, 
  Fade,
  Box
} from "@mui/material";
import { WarningAmberRounded } from "@mui/icons-material";

/**
 * ConfirmModal - Componente de Dialogo Atómico
 * Utiliza el Sistema de Diseño Global para mantener coherencia visual.
 */
export default function ConfirmModal({ 
  show, 
  onHide, 
  onConfirm, 
  title = "Confirmar acción", 
  message = "¿Estás seguro de que deseas continuar?",
  confirmText = "Confirmar",
  confirmColor = "error", // 'error', 'primary', 'warning', etc.
  loading = false 
}) {
  return (
    <Dialog
      open={show}
      onClose={onHide}
      TransitionComponent={Fade}
      transitionDuration={300}
      maxWidth="xs"
      fullWidth
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      PaperProps={{
        sx: { borderRadius: 3, p: 1 }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', pl: 3, pt: 2, gap: 1 }}>
        {confirmColor === "error" && (
          <WarningAmberRounded color="error" fontSize="medium" />
        )}
        <DialogTitle id="confirm-dialog-title" sx={{ p: 0, fontWeight: 800 }}>
          {title}
        </DialogTitle>
      </Box>

      <DialogContent sx={{ mt: 1 }}>
        <DialogContentText id="confirm-dialog-description" sx={{ color: 'text.secondary' }}>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button 
          onClick={onHide} 
          color="inherit" 
          sx={{ fontWeight: 600, textTransform: 'none' }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color={confirmColor}
          disableElevation
          autoFocus
          disabled={loading}
          sx={{ 
            borderRadius: 2, 
            px: 3, 
            fontWeight: 700,
            textTransform: 'none'
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}