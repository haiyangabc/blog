import { Mail, MessageCircle, Twitter, Linkedin, Github } from "lucide-react"
const contactMethods = [
  {
    icon: Mail,
    title: "邮箱",
    description: "1484974776@qq.com",
    href: "mailto:john.doe@example.com",
    color: "bg-red-100 text-red-600",
  },
  {
    icon: Github,
    title: "GitHub",
    description: "@johndoe",
    href: "https://github.com/johndoe",
    color: "bg-gray-100 text-gray-600",
  },
]

export function ContactSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">联系我</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            有任何问题或想法？欢迎随时与我联系，我很乐意与你交流
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <a
              key={index}
              href={method.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gray-50 p-6 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-200"
            >
              <div
                className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <method.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.title}</h3>
              <p className="text-gray-600 text-sm">{method.description}</p>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          {/* <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-80" /> */}
          <h3 className="text-2xl font-bold mb-4">让我们一起创造些什么</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            无论是技术讨论、项目合作，还是简单的问候，我都很期待听到你的声音
          </p>
          <a
            href="mailto:john.doe@example.com"
            className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            {/* <Mail className="mr-2 w-4 h-4" /> */}
            发送邮件
          </a>
        </div>
      </div>
    </section>
  )
}
