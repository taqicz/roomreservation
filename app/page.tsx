import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">Room Reservation System</h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl">
              Book rooms for your events, meetings, and activities at the Faculty of Computer Science
            </p>
            <div className="mt-10 flex justify-center">
              <Button asChild size="lg" className="rounded-md">
                <Link href="/rooms">Browse Rooms</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Easy Room Booking Process</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">Book rooms in just a few simple steps</p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="flex justify-center items-center h-12 w-12 rounded-md bg-primary text-white mx-auto">
                1
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Browse Available Rooms</h3>
              <p className="mt-2 text-base text-gray-500">
                Explore our selection of rooms with detailed information and photos
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="flex justify-center items-center h-12 w-12 rounded-md bg-primary text-white mx-auto">
                2
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Select Date and Time</h3>
              <p className="mt-2 text-base text-gray-500">
                Choose your preferred date and time for your event or meeting
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="flex justify-center items-center h-12 w-12 rounded-md bg-primary text-white mx-auto">
                3
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Confirm Your Booking</h3>
              <p className="mt-2 text-base text-gray-500">Submit your booking request and receive confirmation</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
              <div className="lg:self-center">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                  <span className="block">Ready to book a room?</span>
                </h2>
                <p className="mt-4 text-lg leading-6 text-gray-500">
                  Sign in to your account to start booking rooms for your events.
                </p>
                <div className="mt-8">
                  <Button asChild size="lg">
                    <Link href="/auth">Get Started</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
