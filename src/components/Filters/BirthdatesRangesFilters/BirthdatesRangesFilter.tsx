import { InputAgeRange } from 'components/Inputs'
import { InputWrapper } from 'components/ui/Inputs/styles'
import { FormContext } from 'components/ui/Modal/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { DateRange } from 'types/searchCriterias'

type BirthdatesRangesFilterProps = {
  value: DateRange
  name: string
}

const BirthdatesRangesFilter = ({ name, value }: BirthdatesRangesFilterProps) => {
  const context = useContext(FormContext)
  const [birthdatesRanges, setBirthdatesRanges] = useState(value)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const _onError = (isError: boolean, errorMessage = '') => {
    setError(isError)
    setErrorMessage(errorMessage)
  }

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, birthdatesRanges)
  }, [birthdatesRanges[0], birthdatesRanges[1]])

  return (
    <InputWrapper>
      <InputAgeRange
        error={{ isError: error, errorMessage: errorMessage }}
        onError={_onError}
        birthdatesRanges={birthdatesRanges}
        onChangeBirthdatesRanges={(newBirthdatesRanges) => setBirthdatesRanges(newBirthdatesRanges)}
      />
    </InputWrapper>
  )
}

export default BirthdatesRangesFilter