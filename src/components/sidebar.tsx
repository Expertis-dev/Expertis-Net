"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronRight, LogOut } from "lucide-react"
import Link from "next/link"

interface MenuItem {
  id: string
  title: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  href: string
  subItems: { title: string; href: string }[]
}

interface SidebarProps {
  menuItems: MenuItem[]
  expandedMenus: string[]
  toggleMenu: (menuId: string) => void
  pathname: string
  onLogout: () => void
  isMobile: boolean
}

export function Sidebar({ menuItems, expandedMenus, toggleMenu, pathname, onLogout }: SidebarProps) {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <div key={item.id}>
              {item.subItems.length > 0 ? (
                <div>
                  <Button
                    variant="ghost"
                    className="sidebar-item w-full justify-between h-12 px-4 text-left font-medium"
                    onClick={() => toggleMenu(item.id)}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedMenus.includes(item.id) ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </Button>

                  <AnimatePresence>
                    {expandedMenus.includes(item.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="ml-8 mt-2 space-y-1">
                          {item.subItems.map((subItem) => (
                            <motion.div
                              key={subItem.href}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Link href={subItem.href}>
                                <Button
                                  variant="ghost"
                                  className={`w-full justify-start h-10 px-4 text-sm transition-all duration-200 ${
                                    pathname === subItem.href ? "sidebar-item-active" : "sidebar-item"
                                  }`}
                                >
                                  <ChevronRight className="h-3 w-3 mr-2" />
                                  {subItem.title}
                                </Button>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start h-12 px-4 transition-all duration-200 ${
                      pathname === item.href ? "sidebar-item-active" : "sidebar-item"
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.title}
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <Button
          variant="ghost"
          className="w-full justify-start h-12 px-4 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors duration-200"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
