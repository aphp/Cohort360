import React, { useState, useEffect } from 'react'

import { IComposition_Section } from '@ahryman40k/ts-fhir-types/lib/R4'

import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Typography from '@material-ui/core/Typography'

import { Document, Page } from 'react-pdf'
import { FHIR_API_URL } from '../../constants'
import services from 'services'

type DocumentViewerProps = {
  deidentified?: boolean
  open: boolean
  handleClose: () => void
  documentId: string
  list?: string[]
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ deidentified, open, handleClose, documentId, list }) => {
  const [documentContent, setDocumentContent] = useState<IComposition_Section[] | null>(null)
  const [numPages, setNumPages] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const _fetchDocumentContent = async () => {
      setLoading(true)
      if (loading || !documentId || !open) return setLoading(false)

      const documentContent = await services.cohorts.fetchDocumentContent(documentId)
      if (documentContent) {
        setDocumentContent(documentContent)
      }
      setLoading(false)
    }

    if (deidentified) {
      _fetchDocumentContent()
    }

    return () => {
      setDocumentContent(null)
      setNumPages(1)
    }
  }, [open, documentId])

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle id="document-viewer-dialog-title"></DialogTitle>
      {open &&
        (loading ? (
          <DialogContent id="document-viewer-dialog-content">
            <CircularProgress />
          </DialogContent>
        ) : (
          <DialogContent id="document-viewer-dialog-content">
            {deidentified ? (
              <>
                {documentContent && documentContent.length > 0 ? (
                  documentContent.map((section: any) => (
                    <>
                      <Typography variant="h6">{section.title}</Typography>
                      <Typography key={section.title} dangerouslySetInnerHTML={{ __html: section.text?.div ?? '' }} />
                    </>
                  ))
                ) : (
                  <Typography>Le contenu du document est introuvable.</Typography>
                )}
              </>
            ) : (
              <Document
                error={'Le document est introuvable.'}
                loading={'PDF en cours de chargement...'}
                file={{
                  url: `${FHIR_API_URL}/Binary/${documentId}`,
                  httpHeaders: {
                    Accept: 'application/pdf',
                    Authorization: `Bearer ${localStorage.getItem('access')}`,
                    _list: list?.join(',')
                  }
                }}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <Page
                    width={window.innerWidth * 0.9}
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    loading={'Pages en cours de chargement...'}
                  />
                ))}
              </Document>
            )}
          </DialogContent>
        ))}
      <DialogActions>
        <Button autoFocus onClick={handleClose}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DocumentViewer