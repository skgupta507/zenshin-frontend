import AnimeCard from '../components/AnimeCard'
import useTopAiringAnime from '../hooks/useTopAiringAnime'
// import zenshin1 from '../assets/zenshin2.png'
import zenshinLogo from '../assets/zenshinLogo.png'
import InfiniteScroll from 'react-infinite-scroll-component'
import { getTopAnime } from '../utils/helper'
import { useEffect, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Spinner } from '@radix-ui/themes'
import { toast } from 'sonner'
import { ExclamationTriangleIcon, PersonIcon, StarIcon, VideoIcon } from '@radix-ui/react-icons'
// import loundraw from "../assets/loundraw.jpg";
// import gradient1 from '../assets/gradient1.jpg'
import SkeletonAnimeCard from '../skeletons/SkeletonAnimeCard'
import { getCurrentSeason } from '../utils/currentSeason'
import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import HTMLReactParser from 'html-react-parser/lib/index'
import { useNavigate } from 'react-router-dom'
import useGetRecentGlobalActivity from '../hooks/useGetRecentGlobalActivity'
import RecentActivity from '../components/RecentActivity'

export default function Home() {
  // GET RECENT GLOBAL ACTIVITY : UI NOT IMPLEMENTED
  const {
    isLoading: isLoadingRecentActivity,
    data: recentActivity,
    error: errorRecentActivity,
    status: statusRecentActivity
  } = useGetRecentGlobalActivity()

  // State to store background opacity
  const [bgOpacity, setBgOpacity] = useState(1)

  // Update opacity on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      // Adjust the value as per your requirement, this reduces opacity with scroll
      const newOpacity = Math.max(0, 1 - scrollY / 500) // Minimum opacity is 0.3
      setBgOpacity(newOpacity)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const { isLoading, topAiringAnime, error, status } = useTopAiringAnime()

  // get current year and season
  const currentYear = new Date().getFullYear()
  // season: WINTER, SPRING, SUMMER, FALL
  const currentSeason = getCurrentSeason()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    error: infiniteQueryError
  } = useInfiniteQuery({
    queryKey: ['top_animes'],
    queryFn: ({ pageParam = 1 }) => getTopAnime(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return allPages.length + 1
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 // 1 hour
  })

  // if (infiniteQueryError) {
  //   toast.error('Error fetching Top Animes', {
  //     icon: <ExclamationTriangleIcon height="16" width="16" color="#ffffff" />,
  //     description: infiniteQueryError?.message,
  //     classNames: {
  //       title: 'text-rose-500'
  //     }
  //   })
  // }

  useEffect(() => {
    if (errorRecentActivity) {
      toast.error('Error fetching Recent Activity', {
        icon: <ExclamationTriangleIcon height="16" width="16" color="#ffffff" />,
        description: errorRecentActivity?.message,
        classNames: {
          title: 'text-rose-500'
        }
      })
    }

    if (infiniteQueryError) {
      toast.error('Error fetching Top Animes', {
        icon: <ExclamationTriangleIcon height="16" width="16" color="#ffffff" />,
        description: infiniteQueryError?.message,
        classNames: {
          title: 'text-rose-500'
        }
      })
    }
  }, [errorRecentActivity, infiniteQueryError])

  const [topAnime, setTopAnime] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (data) {
      const newTopAnime = data.pages
        .map((page) => page)
        .flat()
        .filter(Boolean)
      setTopAnime(newTopAnime)
    }
  }, [data])

  return (
    <div className="select-none font-space-mono tracking-tight">
      <div
        className="relative flex min-h-[96svh] animate-fade flex-col items-center justify-around gap-y-11 lg:flex-row"
        style={
          {
            // backgroundImage: `url(${gradient1})`,
            // backgroundSize: 'cover',
            // background: `linear-gradient(rgba(17,17,19,${1 - bgOpacity}), rgba(17,17,19,${1 - bgOpacity})), url(${gradient1})`
          }
        }
      >
        <div
          className="stroke-text absolute top-[-200px] w-full overflow-hidden text-nowrap text-[22rem] text-[#ffffff20]"
          style={{
            opacity: bgOpacity
          }}
        >
          全身全身全身
        </div>
        <div
          className="stroke-text absolute w-full overflow-hidden text-nowrap text-[22rem] text-[#ffffff20]"
          style={{
            opacity: bgOpacity
          }}
        >
          ZENSHIN ZENSHIN ZENSHIN
        </div>
        <div
          className="stroke-text absolute bottom-[-200px] w-full overflow-hidden text-nowrap text-[22rem] text-[#ffffff20]"
          style={{
            opacity: bgOpacity
          }}
        >
          七転び八起き
        </div>

        <div className="my-12 flex h-full w-8/12 flex-col items-center justify-start gap-y-1 p-3 lg:w-2/5">
          <img src={zenshinLogo} alt="" className="drop-shadow-xl h-[6rem] object-scale-down" />
          <p className="font-space-mono">
            Stream your favourite torrents instantly with our service, no waiting for downloads,
            reliable and seamless streaming directly to your browser / VLC Media Player.
          </p>
        </div>

        {/* <img
          src={zenshin1}
          alt="zenshin"
          className="drop-shadow-lg h-48 object-scale-down sm:h-64 md:h-80 lg:h-96"
        /> */}

        {recentActivity && <RecentActivity data={Object.values(recentActivity).slice(0, 9)} />}
      </div>

      {topAiringAnime?.length > 0 && (
        <div
          className={`w-full`}
          style={{
            opacity: 1 - bgOpacity
          }}
        >
          <div className="animate-fade">
            <Carousel
              axis="horizontal"
              showArrows={true}
              showThumbs={false}
              autoPlay
              interval={5000}
              infiniteLoop
              renderIndicator={false}
              emulateTouch
            >
              {topAiringAnime
                ?.filter(
                  (anime) =>
                    anime.seasonYear === currentYear &&
                    anime.season.toLowerCase() === currentSeason.toLowerCase() &&
                    anime.bannerImage !== null
                )
                .slice(0, 5)
                .map((anime) => (
                  // gradient from left to right black to transparent
                  <div
                    key={anime.id + 'bannerAnime'}
                    className="relative h-72 cursor-pointer"
                    onClick={() => navigate(`/anime/${anime.id}`, { state: { data: anime } })}
                  >
                    <div className="mask absolute h-full w-8/12 bg-gradient-to-r from-[#141414] backdrop-blur-md"></div>
                    <div className="absolute ml-5 flex h-full flex-col items-start justify-center gap-y-2 px-2">
                      <div className="line-clamp-1 max-w-xl bg-gradient-to-r from-[#14141480] py-1 text-start text-2xl font-semibold tracking-wider text-white drop-shadow-3xl">
                        {anime.title.romaji}
                      </div>
                      <div className="mb-4 line-clamp-1 max-w-2xl text-start text-xs tracking-wider text-white drop-shadow-3xl">
                        {anime.title.english}
                      </div>

                      {anime.description && (
                        <div className="line-clamp-[9] w-80 text-left text-xs tracking-wide">
                          {HTMLReactParser(anime.description)}
                        </div>
                      )}

                      <div className="flex gap-x-8 border border-[#ffffff70] bg-[#00000050] px-1 py-1 text-xs backdrop-blur-[2px]">
                        <div>{anime.episodes || 0} episodes</div>
                        {anime.averageScore && (
                          <div className="flex items-center gap-x-1 tracking-wide">
                            <StarIcon /> {anime.averageScore} / 100
                          </div>
                        )}
                        <div className="flex items-center gap-x-1 tracking-wide">
                          <PersonIcon />
                          {anime.popularity.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-x-1 tracking-wide">
                          <VideoIcon className="h-4 w-4 text-white" />
                          {anime.format.slice(0, 3)}
                        </div>
                      </div>
                    </div>
                    <img src={anime.bannerImage} alt="" className="h-72 w-full object-cover" />
                  </div>
                ))}
            </Carousel>
          </div>
        </div>
      )}

      {error && (
        <div className="text-red-500">Failed to fetch Top Airing Anime : {error.message}</div>
      )}

      {/* {status === 'success' && !error && ( */}
      {!error && (
        <div className="mx-5 mt-8">
          <div className="mb-2 ml-5 border-b border-gray-700 pb-1 font-space-mono text-lg font-bold tracking-wider">
            Top Airing Anime
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg2:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-9">
            {!isLoading &&
              !error &&
              topAiringAnime?.map((anime) => (
                <AnimeCard key={anime.id + 'topAiringAnime'} data={anime} />
              ))}
            {isLoading && (
              <>
                <SkeletonAnimeCard />
                <SkeletonAnimeCard />
                <SkeletonAnimeCard />
                <SkeletonAnimeCard />
                <SkeletonAnimeCard />
                <SkeletonAnimeCard />
                <SkeletonAnimeCard />
              </>
            )}
          </div>
        </div>
      )}

      {infiniteQueryError && (
        <div className="text-red-500">Failed to fetch Top Anime : {infiniteQueryError.message}</div>
      )}

      {!infiniteQueryError && topAnime.length > 0 && (
        <div className="mx-5 mt-12">
          <div className="mb-2 ml-5 border-b border-gray-700 pb-1 font-space-mono text-lg font-bold tracking-wider">
            Top Anime
          </div>

          <div className={`w-full mb-2`}>
            <div className="animate-fade">
              <Carousel
                axis="horizontal"
                showArrows={true}
                showThumbs={false}
                autoPlay
                interval={5000}
                infiniteLoop
                renderIndicator={false}
                emulateTouch
              >
                {topAnime.slice(0, 8).map((anime) => (
                  // gradient from left to right black to transparent
                  <div
                    key={anime.id + 'bannerAnime'}
                    className="relative h-72 cursor-pointer"
                    onClick={() => navigate(`/anime/${anime.id}`, { state: { data: anime } })}
                  >
                    <div className="mask absolute h-full w-8/12 bg-gradient-to-r from-[#141414] backdrop-blur-md"></div>
                    <div className="absolute ml-5 flex h-full flex-col items-start justify-center gap-y-2 px-2">
                      <div className="line-clamp-1 max-w-xl bg-gradient-to-r from-[#14141480] py-1 text-start text-2xl font-semibold tracking-wider text-white drop-shadow-3xl">
                        {anime.title.romaji}
                      </div>
                      <div className="mb-4 line-clamp-1 max-w-2xl text-start text-xs tracking-wider text-white drop-shadow-3xl">
                        {anime.title.english}
                      </div>

                      {anime.description && (
                        <div className="line-clamp-[9] w-80 text-left text-xs tracking-wide">
                          {HTMLReactParser(anime.description)}
                        </div>
                      )}

                      <div className="flex gap-x-8 border border-[#ffffff70] bg-[#00000050] px-1 py-1 text-xs backdrop-blur-[2px]">
                        <div>{anime.episodes || 0} episodes</div>
                        {anime.averageScore && (
                          <div className="flex items-center gap-x-1 tracking-wide">
                            <StarIcon /> {anime.averageScore} / 100
                          </div>
                        )}
                        <div className="flex items-center gap-x-1 tracking-wide">
                          <PersonIcon />
                          {anime.popularity.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-x-1 tracking-wide">
                          <VideoIcon className="h-4 w-4 text-white" />
                          {anime.format.slice(0, 3)}
                        </div>
                      </div>
                    </div>
                    <img src={anime.bannerImage} alt="" className="h-72 w-full object-cover" />
                  </div>
                ))}
              </Carousel>
            </div>
          </div>

          <InfiniteScroll
            style={{ all: 'unset' }}
            dataLength={topAnime.length}
            next={() => fetchNextPage()}
            hasMore={topAnime?.length < 500}
            loader={
              <div className="flex items-center justify-center gap-x-2 overflow-hidden">
                <h4>Loading...</h4>
                <Spinner />
              </div>
            }
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg2:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-9">
              {topAnime?.map((anime) => {
                return <AnimeCard key={anime.id + 'topAnime'} data={anime} />
              })}
              {isFetching && (
                <>
                  <SkeletonAnimeCard />
                  <SkeletonAnimeCard />
                  <SkeletonAnimeCard />
                  <SkeletonAnimeCard />
                  <SkeletonAnimeCard />
                  <SkeletonAnimeCard />
                  <SkeletonAnimeCard />
                </>
              )}
            </div>
          </InfiniteScroll>
        </div>
      )}
    </div>
  )
}
