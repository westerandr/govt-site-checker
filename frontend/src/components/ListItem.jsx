import React from 'react'
import Loader from './Loader.jsx'
import Status from './Status.jsx'
import SnapshotTooltip from './SnapshotTooltip.jsx'
import { updateSite, getSiteData, refresh } from '../stores/sites.js';
import { useStore } from '@nanostores/react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

// Shared position tracker for FLIP animations
const positionMap = new Map();

const ListItem = React.memo((props) => {
const PUBLIC_API_URL = import.meta.env.PUBLIC_API_URL;
  const { id, title, url, listType, index, site: siteFromProps } = props
  // Use site data from props if available, otherwise fall back to getSiteData
  const siteData = siteFromProps || getSiteData(id)
  const [loading, setLoading] = React.useState(false);
  const [fetched, setFetched] = React.useState(siteData?.fetched)
  const [status, setStatus] = React.useState(siteData?.status);
  const [latency, setLatency] = React.useState(siteData?.latency);
  
  // Update state when siteData changes (e.g., when site moves to online list with latency)
  React.useEffect(() => {
    const currentSiteData = siteFromProps || getSiteData(id);
    if (currentSiteData) {
      if (currentSiteData.fetched !== undefined) setFetched(currentSiteData.fetched);
      if (currentSiteData.status !== undefined) setStatus(currentSiteData.status);
      if (currentSiteData.latency !== undefined) setLatency(currentSiteData.latency);
    }
  }, [siteFromProps, id]);
  const [isHovered, setIsHovered] = React.useState(false);
  const [snapshot, setSnapshot] = React.useState(null);
  const [snapshotLoading, setSnapshotLoading] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(true);
  const prevListTypeRef = React.useRef(listType);
  const isFirstRenderRef = React.useRef(true);
  const itemRef = React.useRef(null);
  const prevIndexRef = React.useRef(index);
  const [isSorting, setIsSorting] = React.useState(false);
  const functionsEndPoint = `${PUBLIC_API_URL}`
  const snapshotEndPoint = `${PUBLIC_API_URL}/snapshot`
  const isOk = (data) => data.status
  const refreshStore = useStore(refresh)
  if (!title || !url) return null

  // Animate when component mounts or when listType changes
  React.useEffect(() => {
    // Animate on first render or when listType changes
    if (isFirstRenderRef.current || prevListTypeRef.current !== listType) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        isFirstRenderRef.current = false;
      }, 400);
      prevListTypeRef.current = listType;
      return () => clearTimeout(timer);
    }
  }, [listType]);

  // Capture position after render (First in FLIP)
  React.useEffect(() => {
    if (itemRef.current && listType === 'online') {
      const element = itemRef.current;
      const rect = element.getBoundingClientRect();
      const parentRect = element.parentElement?.getBoundingClientRect();
      
      if (parentRect) {
        const position = {
          top: rect.top - parentRect.top,
          left: rect.left - parentRect.left,
        };
        // Only store if we don't have a position yet, or if index hasn't changed
        // This ensures we capture the "first" position before sorting
        if (!positionMap.has(id) || prevIndexRef.current === index) {
          positionMap.set(id, position);
        }
      }
    }
  });

  // Animate position changes (FLIP technique)
  useIsomorphicLayoutEffect(() => {
    if (itemRef.current && listType === 'online' && !isFirstRenderRef.current) {
      const element = itemRef.current;
      const prevPosition = positionMap.get(id);
      
      if (prevPosition && prevIndexRef.current !== index) {
        const rect = element.getBoundingClientRect();
        const parentRect = element.parentElement?.getBoundingClientRect();
        
        if (parentRect) {
          const currentPosition = {
            top: rect.top - parentRect.top,
            left: rect.left - parentRect.left,
          };
          
          const deltaY = prevPosition.top - currentPosition.top;
          const deltaX = prevPosition.left - currentPosition.left;
          
          // Only animate if position actually changed significantly
          if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
            // Invert: move element back to previous position
            element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            element.style.transition = 'none';
            setIsSorting(true);
            
            // Play: animate to new position
            requestAnimationFrame(() => {
              element.style.transform = '';
              element.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
              
              setTimeout(() => {
                setIsSorting(false);
                element.style.transition = '';
              }, 400);
            });
          }
          
          // Update stored position for next comparison
          positionMap.set(id, currentPosition);
        }
      }
    }
    
    prevIndexRef.current = index;
  }, [index, listType, id]);

  React.useEffect(() => {
    if(fetched && !refreshStore) return
    setLoading(true)
    try{
    fetch(`${functionsEndPoint}?${new URLSearchParams({ url })}`)
    .then(res =>  res.json())
    .then(data => {
       setLatency(data.latency)
      setStatus(isOk(data))
      updateSite(id, { status: isOk(data), latency: data.latency, fetched: true })
    })
      .catch(_err => {
        setStatus(false)
        updateSite(id, { status: false, latency: null, fetched: true })
      })
    .finally(() => {
      setLoading(false)
      setFetched(true)
    })
  }catch(err){
    console(JSON.stringify(err))
  }
  }, [refreshStore])

  // Preload snapshot - only fetch for online sites
  React.useEffect(() => {
    // Only fetch if site is online (status is true) and we don't already have a snapshot
    if (!status || snapshot) return;

    const fetchSnapshot = async () => {
      // Start timing snapshot fetch
      const snapshotStartTime = performance.now();
      const snapshotFetchStartTime = Date.now();
      console.log(`[${id}] Snapshot fetch started at ${new Date(snapshotFetchStartTime).toISOString()}`);
      
      setSnapshotLoading(true);
      try {
        const response = await fetch(`${snapshotEndPoint}?${new URLSearchParams({ url })}`);
        const data = await response.json();
        if (data.snapshot) {
          // Measure time until snapshot data is received
          const snapshotDataReceivedTime = performance.now();
          const snapshotDataDuration = snapshotDataReceivedTime - snapshotStartTime;
          
          setSnapshot(data.snapshot);
          
          // Measure time until image is loaded
          const img = new Image();
          img.onload = () => {
            const snapshotLoadedTime = performance.now();
            const snapshotLoadDuration = snapshotLoadedTime - snapshotStartTime;
            const imageLoadDuration = snapshotLoadedTime - snapshotDataReceivedTime;
            
            console.log(`[${id}] Snapshot available | Data fetch: ${snapshotDataDuration.toFixed(2)}ms | Image load: ${imageLoadDuration.toFixed(2)}ms | Total: ${snapshotLoadDuration.toFixed(2)}ms`);
          };
          img.onerror = () => {
            const snapshotErrorTime = performance.now();
            const snapshotErrorDuration = snapshotErrorTime - snapshotStartTime;
            console.log(`[${id}] Snapshot image failed to load | Time taken: ${snapshotErrorDuration.toFixed(2)}ms`);
          };
          img.src = data.snapshot;
          
          console.log(`[${id}] Snapshot data received: ${snapshotDataDuration.toFixed(2)}ms`);
        }
      } catch (error) {
        const snapshotErrorTime = performance.now();
        const snapshotErrorDuration = snapshotErrorTime - snapshotStartTime;
        console.error(`[${id}] Error preloading snapshot for ${url}:`, error);
        console.log(`[${id}] Snapshot fetch failed | Time taken: ${snapshotErrorDuration.toFixed(2)}ms`);
      } finally {
        setSnapshotLoading(false);
      }
    };

    // If latency is already available (site is online), fetch snapshot immediately
    // Otherwise, wait until status becomes true
    const delay = (latency != null && status) ? 100 : 0;
    const timeoutId = setTimeout(fetchSnapshot, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [url, snapshot, snapshotEndPoint, latency, status, id]);

  // Determine animation direction based on list type
  const getAnimationClass = () => {
    if (!isAnimating) return '';
    if (listType === 'offline') return 'animate-slide-in-down';
    if (listType === 'online') return 'animate-slide-in-up';
    return 'animate-fade-in';
  };

  return <li 
    ref={itemRef}
    className={`relative flex justify-between gap-x-6 mb-3 ${getAnimationClass()}`}
    style={{ willChange: isSorting ? 'transform' : 'auto' }}
  >
  <div className="flex gap-x-4">
    <div className="min-w-0 flex-auto">
      <p className="text-sm font-semibold leading-6 text-gray-900">
        <span>
          {title}
        </span>
      </p>
      <div className="relative inline-block">
        <a 
          href={`https://${url}`} 
          target="_blank" 
          className="text-xs leading-6 text-blue-500 cursor-pointer underline z-20"
          onMouseEnter={() => status && setIsHovered(true)}
          onMouseLeave={() => status && setIsHovered(false)}
        >
          <svg className='text-blue-500 text-sm inline-block mr-1' width="11px" height="11px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.16488 17.6505C8.92513 17.8743 8.73958 18.0241 8.54996 18.1336C7.62175 18.6695 6.47816 18.6695 5.54996 18.1336C5.20791 17.9361 4.87912 17.6073 4.22153 16.9498C3.56394 16.2922 3.23514 15.9634 3.03767 15.6213C2.50177 14.6931 2.50177 13.5495 3.03767 12.6213C3.23514 12.2793 3.56394 11.9505 4.22153 11.2929L7.04996 8.46448C7.70755 7.80689 8.03634 7.47809 8.37838 7.28062C9.30659 6.74472 10.4502 6.74472 11.3784 7.28061C11.7204 7.47809 12.0492 7.80689 12.7068 8.46448C13.3644 9.12207 13.6932 9.45086 13.8907 9.7929C14.4266 10.7211 14.4266 11.8647 13.8907 12.7929C13.7812 12.9825 13.6314 13.1681 13.4075 13.4078M10.5919 10.5922C10.368 10.8319 10.2182 11.0175 10.1087 11.2071C9.57284 12.1353 9.57284 13.2789 10.1087 14.2071C10.3062 14.5492 10.635 14.878 11.2926 15.5355C11.9502 16.1931 12.279 16.5219 12.621 16.7194C13.5492 17.2553 14.6928 17.2553 15.621 16.7194C15.9631 16.5219 16.2919 16.1931 16.9495 15.5355L19.7779 12.7071C20.4355 12.0495 20.7643 11.7207 20.9617 11.3787C21.4976 10.4505 21.4976 9.30689 20.9617 8.37869C20.7643 8.03665 20.4355 7.70785 19.7779 7.05026C19.1203 6.39267 18.7915 6.06388 18.4495 5.8664C17.5212 5.3305 16.3777 5.3305 15.4495 5.8664C15.2598 5.97588 15.0743 6.12571 14.8345 6.34955" stroke="#0000ff" strokeWidth="2" strokeLinecap="round"/>
          </svg>{url}
          </a>
          { status && <SnapshotTooltip 
          snapshot={snapshot} 
          loading={snapshotLoading} 
          visible={isHovered}
        />}

      </div>
    </div>
  </div>
  <div className="flex items-center gap-x-4">
    {loading && <Loader />}
    {!loading && fetched && <Status latency={latency} status={status} />}
  </div>
</li>
})

export default ListItem