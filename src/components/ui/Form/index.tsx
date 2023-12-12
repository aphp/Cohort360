import { styled } from '@mui/material'

export const FormWrapper = styled('div')(() => ({
  padding: 0,
  '& > div': {
    marginBottom: 20
  }
}))

export const FormLabelWrapper = styled('legend')(() => ({
  color: '#153D8A',
  fontWeight: 600,
  fontSize: 12,
  paddingBottom: 10
}))
