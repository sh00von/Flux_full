"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getAllForumPosts } from "@/lib/forum"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, MessageSquarePlus, User, Calendar, MessageSquare } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { isAuthenticated } from "@/lib/auth"
import type { ForumPost } from "@/lib/forum"

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false)

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getAllForumPosts()
        setPosts(data)
        setIsUserAuthenticated(isAuthenticated())
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load forum posts"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-gray-500">Loading forum posts...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Community Forum</h1>
          <p className="text-gray-600 mt-1">
            Join discussions, ask questions, and connect with other FluxTrade members
          </p>
        </div>
        {isUserAuthenticated ? (
          <Button asChild>
            <Link href="/forum/create">
              <MessageSquarePlus className="mr-2 h-4 w-4" /> Create New Post
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href="/login?redirect=/forum/create">Log in to Post</Link>
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {posts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-medium mb-2">No Forum Posts Yet</h3>
            <p className="text-gray-500 mb-6">Be the first to start a discussion in our community!</p>
            {isUserAuthenticated ? (
              <Button asChild>
                <Link href="/forum/create">
                  <MessageSquarePlus className="mr-2 h-4 w-4" /> Create New Post
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href="/login?redirect=/forum/create">Log in to Post</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <Link href={`/forum/${post._id}`} className="hover:underline">
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                </Link>
                <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="flex items-center">
                    <User className="h-3 w-3 mr-1" /> {post.author.username}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />{" "}
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 line-clamp-3">{post.content}</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" asChild className="ml-auto">
                  <Link href={`/forum/${post._id}`}>
                    <MessageSquare className="mr-2 h-4 w-4" /> Read More
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
