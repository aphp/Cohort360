import React, { PropsWithChildren, ReactElement, useContext, useEffect, useRef, useState } from 'react'
import Modal, { FormContext } from 'components/ui/Modal'
import Button from 'components/ui/Button'
import { DeleteOutline, Edit, Visibility } from '@mui/icons-material'
import { Checkbox, FormControlLabel, Grid, ListItemIcon, Typography, List as ListMui } from '@mui/material'
import ListItem from 'components/ui/List/ListItem'
import { ListItemWrapper } from './styles'
import InfiniteScroll from 'react-infinite-scroll-component'
import { v4 as uuidv4 } from 'uuid'

type id = string

type ListProps = {
  itemsToRender: ReactElement<typeof ListItem>[]
  count: number
  onSelect: (value: id) => void
  onDisplay?: () => void
  onEdit?: () => void
  onDelete?: (value: id[]) => void
  fetchPaginateData: () => void
}

const List = ({
  count,
  itemsToRender,
  onDelete,
  onSelect,
  onDisplay,
  onEdit,
  fetchPaginateData
}: PropsWithChildren<ListProps>) => {
  const context = useContext(FormContext)
  const [allElements, setAllElements] = useState<{ id: string; checked: boolean }[]>([])
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [toggleDeleteModal, setToggleDeleteModal] = useState(false)
  const [toggleSelectAll, setToggleSelectAll] = useState(false)
  const scrollableUuid = useRef(uuidv4())

  const handleCheck = (id: string) => {
    const newItems = allElements.map((item) => {
      return { ...item, checked: item.id === id ? !item.checked : item.checked }
    })
    setAllElements(newItems)
  }

  useEffect(() => {
    setAllElements(
      itemsToRender.map((item) => {
        return {
          id: item.props.id,
          checked: Boolean(selectedElements.find((selected) => selected === item.props.id))
        }
      })
    )
  }, [itemsToRender])

  useEffect(() => {
    context?.updateError(false)
    setSelectedElements(allElements.filter((elem) => elem.checked)?.map((e) => e.id))
  }, [allElements])

  useEffect(() => {
    context?.updateError(true)
    if (selectedElements.length === 1) {
      context?.updateError(false)
      onSelect(selectedElements[0])
    }
  }, [selectedElements])

  return (
    <Grid container gap={4} marginTop={2}>
      <Grid container item xs={12} alignItems="center" gap={1}>
        {onDisplay && (
          <Grid item xs={3}>
            <Button color="info" icon={<Visibility />} onClick={onDisplay} disabled={selectedElements.length !== 1}>
              Voir
            </Button>
          </Grid>
        )}
        {onEdit && (
          <Grid item xs={4}>
            <Button color="info" icon={<Edit />} onClick={onEdit} disabled={selectedElements.length !== 1}>
              Modifier
            </Button>
          </Grid>
        )}
        {onDelete && (
          <Grid item xs={1}>
            <Button
              color="warning"
              onClick={() => {
                setToggleDeleteModal(true)
                context?.updateError(true)
              }}
              disabled={selectedElements.length < 1}
            >
              <DeleteOutline />
            </Button>
          </Grid>
        )}
      </Grid>
      <Grid container>
        {Boolean(allElements.length) ? (
          <Grid item xs={12}>
            <FormControlLabel
              labelPlacement="end"
              color="warning"
              style={{ margin: 0 }}
              control={
                <Checkbox
                  color="info"
                  onChange={() => {
                    setAllElements(
                      allElements.map((e) => {
                        return { ...e, checked: toggleSelectAll ? false : true }
                      })
                    )
                    setToggleSelectAll(!toggleSelectAll)
                  }}
                />
              }
              label={
                <Typography variant="h3" textTransform="uppercase" color="#0288d1">
                  Tout {toggleSelectAll ? 'désélectionner' : 'sélectionner'}
                </Typography>
              }
            />
            <ListMui
              id={scrollableUuid.current}
              component="nav"
              aria-labelledby="nested-list-subheader"
              style={{ maxHeight: '500px', overflow: 'auto' }}
            >
              <InfiniteScroll
                scrollableTarget={scrollableUuid.current}
                dataLength={allElements.length}
                next={fetchPaginateData}
                hasMore={allElements.length < count}
                scrollThreshold={0.9}
                loader={
                  <Grid container justifyContent="center">
                    <Typography fontWeight={500}>Loading...</Typography>
                  </Grid>
                }
              >
                {allElements.map((elem, index) => (
                  <ListItemWrapper key={elem.id} divider disableGutters sx={{ cursor: 'default' }}>
                    <ListItemIcon>
                      {<Checkbox checked={elem.checked} onChange={() => handleCheck(elem.id)} color="info" />}
                    </ListItemIcon>
                    {itemsToRender[index]}
                  </ListItemWrapper>
                ))}
              </InfiniteScroll>
            </ListMui>
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Typography fontWeight="700" align="center" sx={{ padding: '8px' }}>
              Aucun élément n'a été enregistré
            </Typography>
          </Grid>
        )}
      </Grid>

      {onDelete && (
        <Modal
          width="250px"
          open={toggleDeleteModal}
          onClose={() => {
            context?.updateError(false)
            setToggleDeleteModal(false)
          }}
          onSubmit={() => {
            onDelete(selectedElements)
            context?.updateError(false)
          }}
        >
          <Typography sx={{ color: '#00000099' }} fontWeight={600} fontSize={14}>
            Êtes-vous sur de vouloir supprimer les éléments sélectionnés ?
          </Typography>
        </Modal>
      )}
    </Grid>
  )
}

export default List
