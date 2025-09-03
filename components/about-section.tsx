const skills = [
//   {
//     icon: Code,
//     title: "前端开发",
//     description: "React, Next.js, TypeScript, Tailwind CSS",
//     color: "bg-blue-100 text-blue-600",
//   },
//   {
//     icon: Zap,
//     title: "后端开发",
//     description: "Node.js, Python, PostgreSQL, MongoDB",
//     color: "bg-green-100 text-green-600",
//   },
//   {
//     icon: Palette,
//     title: "UI/UX 设计",
//     description: "Figma, 用户体验设计, 界面设计",
//     color: "bg-purple-100 text-purple-600",
//   },
//   {
//     icon: Users,
//     title: "团队协作",
//     description: "Git, 敏捷开发, 代码审查, 技术分享",
//     color: "bg-orange-100 text-orange-600",
//   },
]

const technologies = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Vue.js",
  "Node.js",
  "Python",
  "PostgreSQL",
  "MongoDB",
  "Docker",
  "AWS",
  "Git",
]

export function AboutSection() {
  return (
    <section className="py-16 bg-gray-50" id="aboutMe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* About Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">关于我</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  我是一名充满热情的全栈开发工程师，拥有 3 年以上的 Web 开发经验。 专注于使用现代技术栈构建高质量的 Web
                  应用程序。
                </p>
                <p>
                  我热爱学习新技术，享受解决复杂问题的过程，并且乐于通过博客分享我的经验和见解。
                  我相信技术的力量可以改变世界，也希望通过我的工作为这个目标贡献一份力量。
                </p>
                <p>
                  除了编程，我还喜欢阅读、摄影和旅行。这些爱好让我保持对世界的好奇心，
                  也为我的创作提供了源源不断的灵感。
                </p>
              </div>
            </div>

            {/* Technologies */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">技术栈</h3>
              <div className="flex flex-wrap gap-2">
                {technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-white text-gray-700 text-sm font-medium rounded-full border border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-colors"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* {skills.map((skill, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300"
              >
                <div className={`w-12 h-12 ${skill.color} rounded-lg flex items-center justify-center mb-4`}>
                  <skill.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{skill.title}</h3>
                <p className="text-gray-600 text-sm">{skill.description}</p>
              </div>
            ))} */}
          </div>
        </div>
      </div>
    </section>
  )
}
