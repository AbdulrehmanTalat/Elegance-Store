import { Metadata } from 'next'
import Breadcrumbs from '@/components/Breadcrumbs'
import { Ruler, ChevronDown } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Size Guide | Elegance Store',
  description: 'Find your perfect fit with our comprehensive size guides for lingerie, jewelry, and more. Expert measurement tips and size charts.',
  alternates: {
    canonical: 'https://elegance-store.vercel.app/size-guide',
  },
}

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <Breadcrumbs
          items={[
            { name: 'Size Guide', href: '/size-guide' },
          ]}
        />

        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Ruler className="text-primary-600" size={48} />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient">Size Guide</span>
          </h1>
          <p className="text-xl text-gray-600">
            Find your perfect fit with our comprehensive sizing charts and measurement tips
          </p>
        </div>

        {/* Bra Size Guide */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-primary-600">Bra Size Guide</h2>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">How to Measure</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-pink-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3">Step 1: Band Size</h4>
                <p className="text-gray-700">
                  Measure around your ribcage, just under your bust. Keep the tape measure snug but not tight. Round to the nearest even number.
                </p>
                <p className="mt-2 font-semibold text-primary-600">
                  Example: 32", 34", 36", 38", etc.
                </p>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3">Step 2: Cup Size</h4>
                <p className="text-gray-700">
                  Measure around the fullest part of your bust. Subtract your band size from this measurement. Each inch represents a cup size.
                </p>
                <p className="mt-2 font-semibold text-primary-600">
                  1" = A, 2" = B, 3" = C, 4" = D, 5" = DD/E
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-primary-600 text-white">
                  <th className="border border-gray-300 px-4 py-3">Band Size (inches)</th>
                  <th className="border border-gray-300 px-4 py-3">Underbust (cm)</th>
                  <th className="border border-gray-300 px-4 py-3">Cup A</th>
                  <th className="border border-gray-300 px-4 py-3">Cup B</th>
                  <th className="border border-gray-300 px-4 py-3">Cup C</th>
                  <th className="border border-gray-300 px-4 py-3">Cup D</th>
                  <th className="border border-gray-300 px-4 py-3">Cup DD/E</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">32</td>
                  <td className="border border-gray-300 px-4 py-2">68-72</td>
                  <td className="border border-gray-300 px-4 py-2">32A</td>
                  <td className="border border-gray-300 px-4 py-2">32B</td>
                  <td className="border border-gray-300 px-4 py-2">32C</td>
                  <td className="border border-gray-300 px-4 py-2">32D</td>
                  <td className="border border-gray-300 px-4 py-2">32DD</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">34</td>
                  <td className="border border-gray-300 px-4 py-2">73-77</td>
                  <td className="border border-gray-300 px-4 py-2">34A</td>
                  <td className="border border-gray-300 px-4 py-2">34B</td>
                  <td className="border border-gray-300 px-4 py-2">34C</td>
                  <td className="border border-gray-300 px-4 py-2">34D</td>
                  <td className="border border-gray-300 px-4 py-2">34DD</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">36</td>
                  <td className="border border-gray-300 px-4 py-2">78-82</td>
                  <td className="border border-gray-300 px-4 py-2">36A</td>
                  <td className="border border-gray-300 px-4 py-2">36B</td>
                  <td className="border border-gray-300 px-4 py-2">36C</td>
                  <td className="border border-gray-300 px-4 py-2">36D</td>
                  <td className="border border-gray-300 px-4 py-2">36DD</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">38</td>
                  <td className="border border-gray-300 px-4 py-2">83-87</td>
                  <td className="border border-gray-300 px-4 py-2">38A</td>
                  <td className="border border-gray-300 px-4 py-2">38B</td>
                  <td className="border border-gray-300 px-4 py-2">38C</td>
                  <td className="border border-gray-300 px-4 py-2">38D</td>
                  <td className="border border-gray-300 px-4 py-2">38DD</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">40</td>
                  <td className="border border-gray-300 px-4 py-2">88-92</td>
                  <td className="border border-gray-300 px-4 py-2">40A</td>
                  <td className="border border-gray-300 px-4 py-2">40B</td>
                  <td className="border border-gray-300 px-4 py-2">40C</td>
                  <td className="border border-gray-300 px-4 py-2">40D</td>
                  <td className="border border-gray-300 px-4 py-2">40DD</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <p className="text-gray-700">
              <strong>Pro Tip:</strong> If you're between sizes, we recommend going up to the larger size for comfort. For personalized assistance, contact our customer service team!
            </p>
          </div>
        </div>

        {/* Ring Size Guide */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-primary-600">Ring Size Guide</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">How to Measure Ring Size</h3>
            <ol className="list-decimal pl-6 space-y-3 text-gray-700">
              <li>Wrap a piece of string or paper strip around the base of your finger</li>
              <li>Mark the point where the ends meet with a pen</li>
              <li>Measure the string or paper with a ruler (in mm)</li>
              <li>Match your measurement to the chart below</li>
            </ol>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-primary-600 text-white">
                  <th className="border border-gray-300 px-4 py-3">US Size</th>
                  <th className="border border-gray-300 px-4 py-3">Circumference (mm)</th>
                  <th className="border border-gray-300 px-4 py-3">Diameter (mm)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { size: 5, circ: 49.3, diam: 15.7 },
                  { size: 6, circ: 51.9, diam: 16.5 },
                  { size: 7, circ: 54.4, diam: 17.3 },
                  { size: 8, circ: 57.0, diam: 18.2 },
                  { size: 9, circ: 59.5, diam: 19.0 },
                  { size: 10, circ: 62.1, diam: 19.8 },
                ].map((row) => (
                  <tr key={row.size} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 font-semibold">{row.size}</td>
                    <td className="border border-gray-300 px-4 py-2">{row.circ}</td>
                    <td className="border border-gray-300 px-4 py-2">{row.diam}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* General Clothing Sizes */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-primary-600">General Clothing Sizes</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-primary-600 text-white">
                  <th className="border border-gray-300 px-4 py-3">Size</th>
                  <th className="border border-gray-300 px-4 py-3">Bust (inches)</th>
                  <th className="border border-gray-300 px-4 py-3">Waist (inches)</th>
                  <th className="border border-gray-300 px-4 py-3">Hips (inches)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">XS</td>
                  <td className="border border-gray-300 px-4 py-2">30-32</td>
                  <td className="border border-gray-300 px-4 py-2">23-25</td>
                  <td className="border border-gray-300 px-4 py-2">33-35</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">S</td>
                  <td className="border border-gray-300 px-4 py-2">32-34</td>
                  <td className="border border-gray-300 px-4 py-2">25-27</td>
                  <td className="border border-gray-300 px-4 py-2">35-37</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">M</td>
                  <td className="border border-gray-300 px-4 py-2">34-36</td>
                  <td className="border border-gray-300 px-4 py-2">27-29</td>
                  <td className="border border-gray-300 px-4 py-2">37-39</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">L</td>
                  <td className="border border-gray-300 px-4 py-2">36-38</td>
                  <td className="border border-gray-300 px-4 py-2">29-31</td>
                  <td className="border border-gray-300 px-4 py-2">39-41</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">XL</td>
                  <td className="border border-gray-300 px-4 py-2">38-40</td>
                  <td className="border border-gray-300 px-4 py-2">31-33</td>
                  <td className="border border-gray-300 px-4 py-2">41-43</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-6">Fitting Tips</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <ChevronDown className="flex-shrink-0 mt-1 rotate-[-90deg]" size={20} />
              <span>Measure yourself wearing minimal clothing for accuracy</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronDown className="flex-shrink-0 mt-1 rotate-[-90deg]" size={20} />
              <span>Keep the measuring tape snug but not tight</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronDown className="flex-shrink-0 mt-1 rotate-[-90deg]" size={20} />
              <span>Double-check measurements for best accuracy</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronDown className="flex-shrink-0 mt-1 rotate-[-90deg]" size={20} />
              <span>When in doubt, size up for comfort</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronDown className="flex-shrink-0 mt-1 rotate-[-90deg]" size={20} />
              <span>Contact us for personalized sizing assistance</span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-6">
            Still not sure about your size?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-block px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg"
            >
              Contact Our Team
            </a>
            <a
              href="/products"
              className="inline-block px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 rounded-full font-bold text-lg hover:scale-105 transition-transform"
            >
              Start Shopping
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
