"use client"

import { useState, Fragment } from "react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut, Maximize } from "lucide-react"
import { tv } from "tailwind-variants"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useMediaQuery } from "@/hooks/use-media-query"

interface EnhancedPDFViewerProps {
  urls: string[]
  initialPage?: number
}

const zoomButtonGroupTW = tv({
  base: "z-40 absolute -bottom-10 left-0 flex items-center gap-4",
  variants: {
    withoutPagination: {
      true: "left-1/2 transform -translate-x-1/2",
    },
  },
})

const paginationTW = tv({
  base: "z-40 flex gap-4 justify-end items-center absolute -bottom-10 right-0",
  variants: {
    noPagination: {
      true: "hidden",
    },
  },
})

const buttonPaginationTW = tv({
  base: "flex justify-center items-center h-6 w-6 hover:shadow-md rounded-lg hover:bg-gray-200 p-1 cursor-pointer transition-all ease-in-out duration-300",
  variants: {
    disabled: {
      true: "opacity-50 cursor-not-allowed",
    },
  },
})

export function EnhancedPDFViewer({ urls, initialPage = 1 }: EnhancedPDFViewerProps) {
  const [page, setPage] = useState(initialPage)
  const [modalOpen, setModalOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const src = urls[page - 1]

  if (!urls || urls.length === 0 || !urls.filter(Boolean).length) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
        <p className="text-muted-foreground">Nenhum documento disponível</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col col-span-1 gap-1 relative border-2 border-dashed border-primary-300 rounded-lg">
      <div className="container mx-auto p-2 relative">
        {isMobile ? (
          <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
            <button
              onClick={() => setModalOpen(true)}
              className="flex flex-col items-center gap-2 p-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
              aria-label="Visualizar documento"
            >
              <Maximize className="h-8 w-8 text-primary" />
              <span className="text-sm text-primary font-medium">Visualizar documento</span>
            </button>
          </div>
        ) : (
          <TransformWrapper wheel={{ step: 0.1 }}>
            {({ zoomIn, zoomOut }) => (
              <Fragment>
                <div className="relative">
                  <TransformComponent contentClass="cursor-grab selection:cursor-grabbing">
                    <img src={src || "/placeholder.svg"} alt="Imagem" className="w-full h-auto rounded-lg" />
                  </TransformComponent>
                  <div
                    className={zoomButtonGroupTW({
                      withoutPagination: urls?.length === 1,
                    })}
                  >
                    <button
                      className="flex justify-center items-center h-6 w-6 hover:shadow-md rounded-lg hover:bg-gray-200 p-1 cursor-pointer transition-all ease-in-out duration-300"
                      onClick={() => zoomOut()}
                      type="button"
                    >
                      <ZoomOut />
                    </button>
                    <button
                      className="flex justify-center items-center h-6 w-6 hover:shadow-md rounded-lg hover:bg-gray-200 p-1 cursor-pointer transition-all ease-in-out duration-300"
                      onClick={() => zoomIn()}
                      type="button"
                    >
                      <ZoomIn />
                    </button>
                  </div>
                  <div
                    className={paginationTW({
                      noPagination: urls?.length === 1,
                    })}
                  >
                    <button
                      className={buttonPaginationTW({
                        disabled: page === 1,
                      })}
                      onClick={(e) => (page !== 1 ? setPage((old) => old - 1) : e.preventDefault())}
                      type="button"
                      disabled={page === 1}
                      title={page !== 1 ? "Página anterior" : "Não há página anterior"}
                    >
                      <ArrowLeft />
                    </button>
                    {page}
                    <button
                      className={buttonPaginationTW({
                        disabled: page === urls?.length,
                      })}
                      onClick={(e) => (page !== urls?.length ? setPage((old) => old + 1) : e.preventDefault())}
                      type="button"
                      disabled={page === urls?.length}
                      title={page !== urls?.length ? "Próxima página" : "Não há próxima página"}
                    >
                      <ArrowRight />
                    </button>
                  </div>
                </div>
              </Fragment>
            )}
          </TransformWrapper>
        )}
      </div>
      {/* Modal para visualização em tela cheia em dispositivos móveis */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-full h-[90vh] p-0 sm:max-w-[90vw]">
          <div className="h-full w-full overflow-auto">
            <img src={src || "/placeholder.svg"} alt="Visualização em tela cheia" className="w-full h-auto" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
