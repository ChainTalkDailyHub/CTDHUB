interface CourseCardProps {
  course: {
    id: string
    slug: string
    title: string
    description: string
    thumbnail: string
    youtubeUrl: string
  }
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="card hover:shadow-outline transition-shadow spotlight">
      <div className="aspect-video bg-ctd-panel rounded-lg mb-4 overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = `https://via.placeholder.com/400x225/0E0E0E/F2F2F2?text=${encodeURIComponent(course.title)}`
          }}
        />
      </div>
      
      <h3 className="text-xl font-semibold text-ctd-text mb-2">{course.title}</h3>
      <p className="text-ctd-mute mb-4 line-clamp-3">{course.description}</p>
      
      <a 
        href={`/courses/${course.slug}`}
        className="btn-primary inline-block w-full text-center"
      >
        Start Course
      </a>
    </div>
  )
}