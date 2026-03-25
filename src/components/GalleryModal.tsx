import {X} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {useEffect} from 'react';
import {galleryData, type GalleryKey} from '../data/gallery';

const imageShapes = [
  'rounded-[2rem]',
  'rounded-[50%_50%_50%_0]',
  'rounded-[10rem_10rem_0_0]',
  'rounded-[5rem_0_5rem_0]',
  'rounded-[0_50%_50%_50%]',
  'rounded-full',
];

export function GalleryModal({
  activeGallery,
  onClose,
}: {
  activeGallery: GalleryKey | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!activeGallery) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeGallery, onClose]);

  const gallery = activeGallery ? galleryData[activeGallery] : null;

  return (
    <AnimatePresence>
      {gallery && (
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          className="fixed inset-0 z-[100] overflow-y-auto bg-white no-scrollbar"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-title"
        >
          <div className="relative min-h-screen p-4 sm:p-5 md:p-12">
            <button
              type="button"
              onClick={onClose}
              className="fixed right-3 top-3 z-[110] flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200 sm:right-4 sm:top-4 sm:h-12 sm:w-12 md:right-8 md:top-8 md:h-14 md:w-14"
              aria-label="Fermer la galerie"
            >
              <X size={24} className="text-gray-900" />
            </button>

            <div className="mx-auto max-w-[1400px] pt-8 sm:pt-10 md:pt-12">
              <motion.h2
                id="gallery-title"
                initial={{y: 20, opacity: 0}}
                animate={{y: 0, opacity: 1}}
                transition={{delay: 0.2}}
                className="mb-6 font-serif text-3xl font-black text-gray-900 sm:mb-8 sm:text-5xl md:text-7xl"
              >
                {gallery.title}
              </motion.h2>

              <motion.div
                initial={{y: 20, opacity: 0}}
                animate={{y: 0, opacity: 1}}
                transition={{delay: 0.3}}
                className="mb-12 flex flex-wrap gap-3 md:mb-16"
              >
                {gallery.services.map((service) => (
                  <span key={service} className="rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
                    {service}
                  </span>
                ))}
              </motion.div>

              <div className="grid grid-cols-1 gap-6 pb-16 sm:gap-8 sm:pb-20 md:grid-cols-2 lg:grid-cols-3">
                {gallery.images.map((image, index) => (
                  <motion.div
                    key={image}
                    initial={{opacity: 0, scale: 0.9}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{delay: 0.4 + (index * 0.1)}}
                    className={`aspect-square w-full overflow-hidden shadow-2xl ${imageShapes[index % imageShapes.length]} [transform:translateZ(0)] isolation-isolate [-webkit-mask-image:-webkit-radial-gradient(white,black)]`}
                  >
                    <img
                      src={image}
                      alt={`${gallery.title} ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
