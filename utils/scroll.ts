export function scrollToSection(sectionId: string, offset = 0): void {
  const section = document.getElementById(sectionId)
  if (section) {
    const top = section.offsetTop - offset
    window.scrollTo({
      top,
      behavior: 'smooth'
    })
  }
}

export function useScrollSpy(sectionIds: string[], offset = 100) {
  let observer: IntersectionObserver | null = null
  let activeSection = ''

  const init = () => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeSection = entry.target.id
          }
        })
      },
      {
        rootMargin: `-${offset}px 0px 0px 0px`,
        threshold: 0.5
      }
    )

    sectionIds.forEach((id) => {
      const element = document.getElementById(id)
      if (element) observer?.observe(element)
    })
  }

  const cleanup = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  return {
    init,
    cleanup,
    getActiveSection: () => activeSection
  }
}

export function useParallax(element: HTMLElement | null, speed = 0.5) {
  let ticking = false
  let scrollY = window.scrollY

  const update = () => {
    if (!element) return
    const yPos = -(scrollY * speed)
    element.style.transform = `translate3d(0, ${yPos}px, 0)`
  }

  const onScroll = () => {
    scrollY = window.scrollY
    if (!ticking) {
      window.requestAnimationFrame(() => {
        update()
        ticking = false
      })
      ticking = true
    }
  }

  const init = () => {
    window.addEventListener('scroll', onScroll)
    update()
  }

  const cleanup = () => {
    window.removeEventListener('scroll', onScroll)
  }

  return {
    init,
    cleanup
  }
}

export function useHorizontalScroll(containerRef: React.RefObject<HTMLElement>) {
  const onWheel = (e: WheelEvent) => {
    if (!containerRef.current) return

    e.preventDefault()
    containerRef.current.scrollLeft += e.deltaY
  }

  const init = () => {
    containerRef.current?.addEventListener('wheel', onWheel)
  }

  const cleanup = () => {
    containerRef.current?.removeEventListener('wheel', onWheel)
  }

  return {
    init,
    cleanup
  }
}